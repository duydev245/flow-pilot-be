import { Injectable, Logger } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { ChangePasswordBodyType, ForgotPasswordBodyType, LoginBodyType, SendOTPBodyType, VerifyOTPBodyType } from './auth.model';
import { TokenService } from 'src/shared/services/token.service';
import { AuthRepository } from './auth.repo';
import { EmailNotFoundException, FirstLoginDefaultPasswordException, InvalidCredentialsException, RefreshTokenAlreadyUsedException } from './auth.error';
import { ExpiredOTPException, InvalidOTPException, InvalidPasswordException, UnauthorizedAccessException, UserNotFoundException } from 'src/shared/error';
import { SuccessResponse } from 'src/shared/sucess';
import { generateOTP, isNotFoundPrismaError } from 'src/shared/helpers';
import { IAccessTokenPayloadCreate } from 'src/shared/types/jwt.type';
import { EmailService } from 'src/shared/services/email.service';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import envConfig from 'src/shared/config';
import id from 'zod/v4/locales/id.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
  ) { }

  async validateVerificationCode(payload: VerifyOTPBodyType) {
    const { email, type, code } = payload

    const verificationCode = await this.authRepository.findUniqueVerificationCode({
      email,
      type,
      code
    });

    if (!verificationCode) {
      throw InvalidOTPException;
    }

    // Check if OTP is expired
    if (verificationCode.expired_at < new Date()) {
      throw ExpiredOTPException;
    }
    return verificationCode;
  }

  async login(body: LoginBodyType) {
    this.logger.log('Run Job Login')
    try {
      const user = await this.authRepository.findUniqueUserIncludeRole({
        email: body.email,
      })

      if (!user) {
        throw InvalidCredentialsException;
      }

      const isPasswordMatch = await this.hashingService.compare(body.password, user.password);
      if (!isPasswordMatch) {
        throw InvalidPasswordException;
      }

      const { accessToken, refreshToken } = await this.generateTokens({
        user_id: user.id,
        role_id: user.role_id,
        roleName: user.role.role,
      })

      return SuccessResponse(
        'Login Sucessful',
        {
          accessToken,
          refreshToken,
          role: user.role.role.toUpperCase(),
          isFirstLogin: user.is_first_login
        }
      )
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async generateTokens({ user_id, role_id, roleName }: IAccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        user_id,
        role_id,
        roleName,
      }),
      this.tokenService.signRefreshToken({
        user_id,
      }),
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      user_id,
      expired_at: new Date(decodedRefreshToken.exp * 1000),
    })
    return { accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    try {
      const refreshTokenInDb = await this.authRepository.findUniqueRefreshToken({ token })

      if (!refreshTokenInDb) {
        throw RefreshTokenAlreadyUsedException;
      }

      const { user_id } = this.tokenService.decodeRefreshToken(token);

      const user = await this.authRepository.findUniqueUserIncludeRole({
        id: user_id,
      })

      if (!user) {
        throw UserNotFoundException;
      }

      const $deleteRefreshToken = this.authRepository.deleteRefreshToken({
        token
      })

      const $tokens = this.generateTokens({
        user_id: user.id,
        role_id: user.role_id,
        roleName: user.role.role,
      })

      const [, tokens] = await Promise.all([$deleteRefreshToken, $tokens])

      const { accessToken, refreshToken } = tokens

      return SuccessResponse(
        'Refresh token Sucessful',
        {
          accessToken,
          refreshToken,
          role: user.role.role.toUpperCase()
        }
      )
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async logout(refreshToken: string) {
    try {
      await this.authRepository.deleteRefreshToken({
        token: refreshToken,
      })

      return SuccessResponse('Logout Sucessful')
    } catch (error) {
      this.logger.error(error.message);

      if (isNotFoundPrismaError(error)) {
        throw RefreshTokenAlreadyUsedException;
      }

      throw UnauthorizedAccessException;
    }
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    try {
      const { email, newPassword, code } = body;
      // Check if email exists
      const user = await this.sharedUserRepository.findUnique({
        email
      });

      if (!user) {
        throw EmailNotFoundException;
      }

      // Validate OTP
      await this.validateVerificationCode({
        email,
        type: TypeOfVerificationCode.forgot_password,
        code
      })

      // Hash new password
      const hashedNewPassword = await this.hashingService.hash(newPassword);

      // Update password and delete used OTP
      await Promise.all([
        this.sharedUserRepository.update({ id: user.id }, { password: hashedNewPassword, is_first_login: false }),
        this.authRepository.deleteVerificationCode({ email, type: TypeOfVerificationCode.forgot_password }),
      ])

      return SuccessResponse('Password reset successful');
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    try {
      const { email, type } = body;

      // Check if email exists in case of forgot password
      const user = await this.sharedUserRepository.findUnique({
        email
      });

      if (type === TypeOfVerificationCode.forgot_password && !user) {
        throw EmailNotFoundException;
      }

      // Block actions for first-login accounts
      if (user?.is_first_login) {
        throw FirstLoginDefaultPasswordException;
      }

      // Generate OTP
      const code = generateOTP()
      await this.authRepository.createVerificationCode({
        email,
        code,
        type,
        expired_at: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)),
      })

      // Send OTP to email
      await this.emailService.sendOTP({ email, code });

      return SuccessResponse('Send OTP Successful');
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async verifyOTP(body: VerifyOTPBodyType) {
    try {
      const { email, type, code } = body;

      const verificationCode = await this.authRepository.findUniqueVerificationCode({
        email,
        type,
        code
      });

      if (!verificationCode) {
        throw InvalidOTPException;
      }

      // Check if OTP is expired
      if (verificationCode.expired_at < new Date()) {
        throw ExpiredOTPException;
      }

      // If everything is fine, delete the used OTP
      await this.authRepository.deleteVerificationCode({
        email,
        type
      });

      return SuccessResponse('OTP verified successfully');
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async changePassword(body: ChangePasswordBodyType) {
    try {
      const { email, newPassword } = body;

      // Check if email exists
      const user = await this.sharedUserRepository.findUnique({
        email
      });

      if (!user) {
        throw EmailNotFoundException;
      }

      // Hash new password
      const hashedNewPassword = await this.hashingService.hash(newPassword);

      // Update password
      await this.sharedUserRepository.update({
        id: user.id
      }, {
        password: hashedNewPassword,
        password_changed_at: new Date(),
        is_first_login: false
      });

      return SuccessResponse('Change password successful');
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

}

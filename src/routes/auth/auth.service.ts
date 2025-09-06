import { Injectable, Logger } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { LoginBodyType } from './auth.model';
import { TokenService } from 'src/shared/services/token.service';
import { AuthRepository } from './auth.repo';
import { EmailNotFoundException, RefreshTokenAlreadyUsedException } from './auth.error';
import { InvalidPasswordException, UnauthorizedAccessException, UserNotFoundException } from 'src/shared/error';
import { SuccessResponse } from 'src/shared/sucess';
import { isNotFoundPrismaError } from 'src/shared/helpers';
import { IAccessTokenPayloadCreate } from 'src/shared/types/jwt.type';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    // private readonly sharedUserRepository: SharedUserRepository,
    private readonly authRepository: AuthRepository,
  ) { }

  async login(body: LoginBodyType) {
    this.logger.log('Run Job Login')
    try {
      const user = await this.authRepository.findUniqueUserIncludeRole({
        email: body.email,
      })
      console.log("🚀 ~ AuthService ~ login ~ user:", user)

      if (!user) {
        throw EmailNotFoundException;
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
          role: user.role.role.toUpperCase()
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
      console.log("🚀 ~ AuthService ~ refreshToken ~ user_id:", user_id)

      const user = await this.authRepository.findUniqueUserIncludeRole({
        id: user_id,
      })
      console.log("🚀 ~ AuthService ~ refreshToken ~ user:", user)

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

}

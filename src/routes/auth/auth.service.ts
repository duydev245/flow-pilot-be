import { Injectable, Logger } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { LoginBodyType } from './auth.model';
import { TokenService } from 'src/shared/services/token.service';
import { AccessTokenPayloadCreate } from 'src/shared/types/jwt.type';
import { AuthRepository } from './auth.repo';
import { EmailNotFoundException, RefreshTokenAlreadyUsedException } from './auth.error';
import { InvalidPasswordException, UnauthorizedAccessException } from 'src/shared/error';
import { SuccessResponse } from 'src/shared/sucess';
import { isNotFoundPrismaError } from 'src/shared/helpers';

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

      return SuccessResponse('Login Sucessful', { accessToken, refreshToken })
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async generateTokens({ user_id, role_id, roleName }: AccessTokenPayloadCreate) {
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

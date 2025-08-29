import { Injectable, Logger } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { LoginBodyType } from './auth.model';
// import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import { TokenService } from 'src/shared/services/token.service';
import { AccessTokenPayloadCreate } from 'src/shared/types/jwt.type';
import { AuthRepository } from './auth.repo';
import { EmailNotFoundException } from './auth.error';
import { InvalidPasswordException } from 'src/shared/error';
import { SuccessResponse } from 'src/shared/sucess';

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

      const key: number = new Date().getTime();

      const accessToken = await this.generateTokens({
        user_id: user.id,
        role_id: user.role_id,
        roleName: user.role.role,
        key
      })

      return SuccessResponse('Login Sucessful', { accessToken })
    } catch (error) {
      this.logger.error(error.message);
      console.error(error);
      throw error;
    }
  }

  async generateTokens({ user_id, role_id, roleName, key }: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        user_id,
        role_id,
        roleName,
        key
      }),
      this.tokenService.signRefreshToken({
        user_id,
        key
      }),
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      user_id,
      expired_at: new Date(decodedRefreshToken.exp * 1000),
    })
    return accessToken;
  }

  logout(token: string) {
    return token
  }

}

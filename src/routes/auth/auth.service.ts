import { Injectable, Logger } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { LoginBodyType } from './auth.model';
// import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import { TokenService } from 'src/shared/services/token.service';
import { AccessTokenPayloadCreate } from 'src/shared/types/jwt.type';
import { AuthRepository } from './auth.repo';
import { EmailNotFoundException } from './auth.error';
import { InvalidPasswordException } from 'src/shared/error';

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
      // 1. Lấy thông tin user, kiểm tra user có tồn tại hay không, mật khẩu có đúng không
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

      const tokens = await this.generateTokens({
        userId: user.id,
        roleId: user.role_id,
        roleName: user.role.role,
        key
      })

      return {
        success: true,
        message: 'Login Sucessful',
        tokens: tokens
      };
    } catch (error) {
      console.error("🚀 ~ AuthService ~ login ~ error:", error)
      throw error;
    }
  }



  async generateTokens({ userId, roleId, roleName, key }: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        roleId,
        roleName,
        key
      }),
      this.tokenService.signRefreshToken({
        userId,
        key
      }),
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    console.log("🚀 ~ AuthService ~ generateTokens ~ decodedRefreshToken:", decodedRefreshToken)
    // await this.authRepository.createRefreshToken({
    //   token: refreshToken,
    //   userId,
    //   expiresAt: new Date(decodedRefreshToken.exp * 1000),
    // })
    return { accessToken, refreshToken }
  }

}

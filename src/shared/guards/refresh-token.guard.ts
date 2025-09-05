// src/modules/auth/guards/refresh-token.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { InvalidExpiredRefreshTokenException, RefreshTokenRequiredException } from '../error';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { refreshTokenPayload?: any }>();
    const body: any = (req as any).body;

    const token = body?.refreshToken;
    if (!token || typeof token !== 'string') {
      throw RefreshTokenRequiredException;
    }

    try {
      const payload = await this.tokenService.verifyRefreshToken(token);
      (req as any).refreshTokenPayload = payload;
      (req as any).refreshToken = token;
      return true;
    } catch (e: any) {
      throw InvalidExpiredRefreshTokenException;
    }
  }
}

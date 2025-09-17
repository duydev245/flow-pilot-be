import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRefreshTokenPayload } from '../types/jwt.type';

export const RefreshTokenPayload = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.refreshTokenPayload as IRefreshTokenPayload;
});

export const RefreshTokenStr = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.refreshToken as string;
});

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RefreshTokenPayload = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.refreshTokenPayload;
});

export const RefreshTokenStr = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.refreshToken as string;
});

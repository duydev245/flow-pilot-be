import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TokenService } from '../services/token.service';
import { PrismaService } from '../services/prisma.service';
import { IAccessTokenPayload } from '../types/jwt.type';
import { AccessTokenRequiredException, ForbiddenResourceException, InvalidExpiredAccessTokenException, UserNotFoundException } from '../error';

@Injectable()
export class AuthRoleGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly tokenService: TokenService,
        private readonly prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const accessToken = request.headers['authorization']?.replace('Bearer ', '');
        if (!accessToken) {
            throw AccessTokenRequiredException;
        }

        let payload: IAccessTokenPayload;
        try {
            payload = await this.tokenService.verifyAccessToken(accessToken);
        } catch (err) {
            throw InvalidExpiredAccessTokenException;
        }

        const { user_id } = payload;
        if (!user_id) {
            throw InvalidExpiredAccessTokenException;
        }

        // Query user and their role from DB
        const user = await this.prisma.user.findUnique({
            where: { id: user_id },
            include: { role: true },
        });
        if (!user || !user.role) {
            throw UserNotFoundException;
        }

        const hasRole = requiredRoles.includes(user.role.role);
        if (!hasRole) {
            throw ForbiddenResourceException;
        }

        // Attach user to request for further use
        (request as any).user = user;
        return true;
    }
}

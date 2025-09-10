import { Injectable } from '@nestjs/common';
import { UserType, UserWithRoleType } from 'src/shared/models/shared-user.model';
import { WhereUniqueUserType } from 'src/shared/repositories/shared-user.repo';
import { PrismaService } from 'src/shared/services/prisma.service';
import { RefreshTokenType, VerificationCodeType } from './auth.model';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async findUniqueUserIncludeRole(where: WhereUniqueUserType): Promise<UserWithRoleType | null> {
    return await this.prismaService.user.findFirst({
      where: {
        ...where,
      },
      include: {
        role: true,
      },
    })
  }

  createRefreshToken(data: { token: string; user_id: string; expired_at: Date }) {
    return this.prismaService.refreshToken.create({
      data,
    })
  }

  deleteRefreshToken(where: { token: string }) {
    return this.prismaService.refreshToken.delete({
      where
    })
  }

  async findUniqueRefreshToken(where: {
    token: string
  }): Promise<RefreshTokenType | null> {
    return await this.prismaService.refreshToken.findUnique({
      where,
    })
  }

  async createVerificationCode(
    payload: Pick<VerificationCodeType, 'email' | 'type' | 'code' | 'expired_at'>,
  ): Promise<VerificationCodeType> {
    return await this.prismaService.verificationCode.upsert({
      where: {
        email_type: {
          email: payload.email,
          type: payload.type,
        },
      },
      create: payload,
      update: {
        code: payload.code,
        expired_at: payload.expired_at,
      },
    })
  }

}

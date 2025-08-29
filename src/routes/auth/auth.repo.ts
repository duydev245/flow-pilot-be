import { Injectable } from '@nestjs/common';
import { UserWithRoleType } from 'src/shared/models/shared-user.model';
import { WhereUniqueUserType } from 'src/shared/repositories/shared-user.repo';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async findUniqueUserIncludeRole(where: WhereUniqueUserType): Promise<UserWithRoleType | null> {
    return this.prismaService.user.findFirst({
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

}

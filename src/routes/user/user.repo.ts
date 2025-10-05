import { Injectable } from '@nestjs/common'
import { UserUpdateType } from 'src/routes/user/user.model'
import { UserStatus } from 'src/shared/constants/auth.constant'
import { RoleNameId } from 'src/shared/constants/role.constant'
import { UserType } from 'src/shared/models/shared-user.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async getAllUsers(actorId: string, page: number, limit: number) {
    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      this.prismaService.user.findMany({
        where: {
          id: {
            not: actorId,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar_url: true,
          department_id: true,
          role_id: true,
          workspace_id: true,
          status: true,
        },
        skip,
        take: limit,
      }),
      this.prismaService.user.count({
        where: {
          id: {
            not: actorId,
          },
        },
      }),
    ])
    return { items, total, page, limit }
  }

  async getAllUsersByWorkspaceId(actorId: string, workspaceId: string, page: number, limit: number) {
    const skip = (page - 1) * limit
    const where = {
      id: { not: actorId },
      workspace_id: workspaceId,
      role_id: {
        not: RoleNameId.SuperAdmin,
        in: [RoleNameId.Admin, RoleNameId.ProjectManager, RoleNameId.Employee],
      },
    }
    const [items, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          avatar_url: true,
          department_id: true,
          role_id: true,
          workspace_id: true,
          status: true,
          role: {
            select: {
              id: true,
              role: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          projectUsers: {
            select: {
              project: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                },
              },
            },
            where: {
              project: {
                status: 'active',
              },
            },
          },
        },
        skip,
        take: limit,
      }),
      this.prismaService.user.count({ where }),
    ])
    return { items, total, page, limit }
  }

  getUserById(userId: string) {
    return this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        phone: true,
        address: true,
        bio: true,
        nickname: true,
        department_id: true,
        role_id: true,
        workspace_id: true,
        status: true,
      },
    })
  }

  getUserByAdmin(where: { id: string; workspace_id: string }) {
    return this.prismaService.user.findUnique({
      where: {
        ...where,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        department_id: true,
        role_id: true,
        workspace_id: true,
        status: true,
      },
    })
  }

  createUser(data: Pick<UserType, 'name' | 'email' | 'password' | 'role_id' | 'workspace_id'>) {
    return this.prismaService.user.create({
      data: {
        ...data,
        status: UserStatus.active,
      },
    })
  }

  updateUserByAdmin(where: { id: string; workspace_id: string }, data: UserUpdateType) {
    return this.prismaService.user.update({
      where: {
        ...where,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        department_id: true,
        role_id: true,
        workspace_id: true,
        status: true,
      },
    })
  }

  updateUserBySuperAdmin(userId: string, data: UserUpdateType) {
    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        department_id: true,
        role_id: true,
        workspace_id: true,
        status: true,
      },
    })
  }
}

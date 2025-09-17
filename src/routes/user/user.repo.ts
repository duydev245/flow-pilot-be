import { Injectable } from '@nestjs/common'
import { UserUpdateType } from 'src/routes/user/user.model'
import { UserStatus } from 'src/shared/constants/auth.constant'
import { RoleNameId } from 'src/shared/constants/role.constant'
import { UserType } from 'src/shared/models/shared-user.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) { }

  getAllUsers(actorId: string) {
    return this.prismaService.user.findMany({
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
    })
  }

  getAllUsersByWorkspaceId(actorId: string, workspaceId: string) {
    return this.prismaService.user.findMany({
      where: {
        id: { not: actorId },
        workspace_id: workspaceId,
        role_id: {
          not: RoleNameId.SuperAdmin, // exclude super admin
          in: [RoleNameId.Admin, RoleNameId.ProjectManager, RoleNameId.Employee], // include only these roles
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
    })
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
        department_id: true,
        role_id: true,
        workspace_id: true,
        status: true,
      },
    })
  }

  getUserByAdmin(where: { id: string, workspace_id: string }) {
    return this.prismaService.user.findUnique({
      where: {
        ...where
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
      }
    })
  }

  updateUserByAdmin(where: { id: string, workspace_id: string }, data: UserUpdateType) {
    return this.prismaService.user.update({
      where: {
        ...where
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

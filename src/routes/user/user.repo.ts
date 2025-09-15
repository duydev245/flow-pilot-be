import { Injectable } from '@nestjs/common'
import { UserCreateType, UserUpdateType } from 'src/routes/user/user.model'
import { UserStatus, UserStatusType } from 'src/shared/constants/auth.constant'
import { UserType } from 'src/shared/models/shared-user.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) { }

  getAllUsers() {
    return this.prismaService.user.findMany({
      where: {
        role_id: {
          not: 1,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        workspace_id: true,
        avatar_url: true,
        status: true,
      },
    })
  }

  getAllUsersByWorkspaceId(workspaceId: string) {
    return this.prismaService.user.findMany({
      where: {
        workspace_id: workspaceId,
        role_id: {
          not: 1,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        workspace_id: true,
        avatar_url: true,
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
        workspace_id: true,
        role_id: true,
        avatar_url: true,
        status: true,
      },
    })
  }

  getUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        workspace_id: true,
        avatar_url: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    })
  }

  getRoleById(roleId: number) {
    return this.prismaService.systemRole.findUnique({
      where: {
        id: roleId,
      },
    })
  }

  async createUserForSuperAdmin(data: Pick<UserType, 'name' | 'email' | 'password' | 'role_id'>) {
    return this.prismaService.user.create({
      data: {
        ...data,
        status: UserStatus.active,
      },
      select: {
        id: true,
        name: true,
        email: true,
        workspace_id: true,
        avatar_url: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    })
  }

  createUser(data: Pick<UserType, 'name' | 'email' | 'password' | 'role_id' | 'workspace_id'>) {
    return this.prismaService.user.create({
      data: {
        ...data,
        status: UserStatus.active,
      },
      select: {
        avatar_url: true,
        name: true,
        email: true,
      },
    })
  }

  updateUser(userId: string, data: UserUpdateType) {
    return this.prismaService.user.update({
      where: {
        id: userId,
        workspace_id: data.workspace_id,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        workspace_id: true,
        avatar_url: true,
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
        workspace_id: true,
        avatar_url: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    })
  }

  updateUserByAdmin(userId: string, data: UserUpdateType, workspaceId: string) {
    return this.prismaService.user.update({
      where: {
        id: userId,
        workspace_id: workspaceId,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        workspace_id: true,
        avatar_url: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    })
  }

  checkUserInWorkspace(userId: string, workspaceId: string) {
    return this.prismaService.user.findFirst({
      where: {
        id: userId,
        workspace_id: workspaceId,
      }
    })
  }

  deleteUser(userId: string, status: UserStatusType) {
    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        status,
      }
    })
  }

  deleteUserByAdmin(userId: string, workspaceId: string) {
    return this.prismaService.user.update({
      where: {
        id: userId,
        workspace_id: workspaceId,
      },
      data: {
        workspace_id: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        workspace_id: true,
        avatar_url: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    })
  }

  createUserForAdmin(data: Pick<UserType, 'name' | 'email' | 'password' | 'role_id'>, workspaceId: string) {
    return this.prismaService.user.create({
      data: {
        ...data,
        workspace_id: workspaceId,
        status: UserStatus.active,
      },
      select: {
        id: true,
        name: true,
        email: true,
        workspace_id: true,
        avatar_url: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    })
  }
}

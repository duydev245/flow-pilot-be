import { Injectable } from '@nestjs/common'
import { UserCreateType, UserUpdateType } from 'src/routes/user/user.model'
import { UserStatus, UserStatusType } from 'src/shared/constants/auth.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  getAllUsers() {
    return this.prismaService.user.findMany({
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
  getAllUsersByWorkspaceId(workspaceId: string) {
    return this.prismaService.user.findMany({
      where: {
        workspace_id: workspaceId,
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
        avatar_url: true,
        status: true,
        created_at: true,
        updated_at: true,
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

  async createUserForSuperAdmin(data: UserCreateType) {
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
  deleteUserBySuperAdmim(userId: string, status: UserStatusType) {
    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        status: status,
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

  createUserForAdmin(data: UserCreateType, workspaceId: string) {
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

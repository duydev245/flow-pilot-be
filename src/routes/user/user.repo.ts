import { Injectable } from '@nestjs/common'
import { UserStatus } from '@prisma/client' // lấy UserStatus từ file shared/constants/auth.constant
import { UserCreateType, UserUpdateType } from 'src/routes/user/user.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) { }

  getAllUsers() {
    return this.prismaService.user.findMany()
  }
  getAllUsersByWorkspaceId(workspaceId: string) {
    return this.prismaService.user.findMany({
      where: {
        workspace_id: workspaceId,
      },
    })
  }

  getUser(userId: string) {
    return this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        status: true,
        created_at: true,
        updated_at: true,
        // ❌ không chọn password, password_changed_at
      },
    })
  }

  getUserById(userId: string) {
    return this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    })
  }
  getUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email: email,
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

  // thêm select để bỏ password, password_changed_at
  async createUserForSuperAdmin(data: UserCreateType) {
    return this.prismaService.user.create({
      data: {
        ...data,
        status: UserStatus.active,
      },
    })
  }

  updateUserBySuperAdmin(userId: string, data: UserUpdateType) {
    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data,
    })
  }
  updateUserByAdmin(userId: string, data: UserUpdateType, workspaceId: string) {
    return this.prismaService.user.update({
      where: {
        id: userId,
        workspace_id: workspaceId,
      },
      data,
    })
  }

  checkUserInWorkspace(userId: string, workspaceId: string) {
    return this.prismaService.user.findFirst({
      where: {
        id: userId,
        workspace_id: workspaceId,
      },
    })
  }
  deleteUserBySuperAdmim(userId: string, status: UserStatus) {
    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        status: status,
      },
    })
  }
  deleteUserByAdmin(userId: string, workspaceId: string) {
    return this.prismaService.user.updateMany({
      where: {
        id: userId,
        workspace_id: workspaceId,
      },
      data: {
        workspace_id: null
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
    })
  }
}

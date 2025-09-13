import { Injectable } from '@nestjs/common'
import {
  EmailAlreadyExistsError,
  GetAllUsersError,
  GetUsersByIdError,
  MissingStatusError,
  UserEmailUpdateNotAllowedError,
  UserNotFoundInWorkSpace,
  UserPermissionDeniedError,
  UserRoleNotFoundError,
  WrongUserIdError,
} from 'src/routes/user/user.errors'
import { UserCreateType, UserDeleteType } from 'src/routes/user/user.model'
import { UserRepository } from 'src/routes/user/user.repo'
import { UserStatusType } from 'src/shared/constants/auth.constant'
import { RoleName } from 'src/shared/constants/role.constant'
import { UserType } from 'src/shared/models/shared-user.model'
import { HashingService } from 'src/shared/services/hashing.service'
import { SuccessResponse } from 'src/shared/sucess'
import { validate as isUuid } from 'uuid'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
  ) {}

  async getAllUsers(role: string, workspaceId: string) {
    if (role !== RoleName.SuperAdmin && role === RoleName.Admin) {
      const result = await this.userRepository.getAllUsersByWorkspaceId(workspaceId)
      return SuccessResponse('Get all users successful', result)
    }
    const result = await this.userRepository.getAllUsers()
    if (!result) {
      throw GetAllUsersError
    }
    const resultWithoutPassword = result.map((user) => {
      const { password, password_changed_at, ...safeRes } = user
      return safeRes
    })
    return SuccessResponse('Get all users successful', resultWithoutPassword)
  }

  getMe(userInfo: UserType) {
    const { password, password_changed_at, ...safeRes } = userInfo
    return SuccessResponse('Get my profile successful', safeRes)
  }

  async getUserById(UserId: string) {
    if (!isUuid(UserId)) {
      throw WrongUserIdError
    }
    const result = await this.userRepository.getUserById(UserId)
    if (!result) {
      throw GetUsersByIdError
    }
    const { password, password_changed_at, ...safeRes } = result
    return SuccessResponse('Get user by ID successful', safeRes)
  }

  async createUser(data: UserCreateType, role: string, workspaceId: string) {
    if (await this.userRepository.getUserByEmail(data.email)) {
      throw EmailAlreadyExistsError
    }
    const isValidRole = await this.userRepository.getRoleById(+data.role_id)
    if (!isValidRole) {
      throw UserRoleNotFoundError
    }

    data.password = await this.hashingService.hash(data.password)

    let result
    if (role === RoleName.Admin) {
      if (isValidRole.role === RoleName.ProjectManager || isValidRole.role === RoleName.Employee) {
        result = await this.userRepository.createUserForAdmin(data, workspaceId)
      } else throw UserPermissionDeniedError
    } else {
      result = await this.userRepository.createUserForSuperAdmin(data)
    }
    const { password, password_changed_at, ...safeRes } = result
    return SuccessResponse('Create user successful', safeRes)
  }

  async updateUser(
    UserId: string,
    data: {
      name?: string
      email?: string
      password?: string
      role_id?: number
      status?: 'active' | 'inactive'
    },
    role: string,
    workspaceId: string,
  ) {
    if (!isUuid(UserId)) {
      throw WrongUserIdError
    }
    if (data.email) {
      throw UserEmailUpdateNotAllowedError
    }
    let isValidRole
    if (data.role_id) {
      isValidRole = await this.userRepository.getRoleById(+data.role_id)
      if (!isValidRole) {
        throw UserRoleNotFoundError
      }
      if (
        role === RoleName.Admin &&
        isValidRole.role !== RoleName.ProjectManager &&
        isValidRole.role !== RoleName.Employee
      ) {
        throw UserPermissionDeniedError
      }
    }
    if (data.password) {
      const hashedPassword = await this.hashingService.hash(data.password)
      data.password = hashedPassword
    }

    let result
    if (role === RoleName.Admin) {
      // Kiểm tra user có thuộc workspace không
      const userInWorkspace = await this.userRepository.checkUserInWorkspace(UserId, workspaceId)
      if (!userInWorkspace) {
        throw UserNotFoundInWorkSpace
      }
      result = await this.userRepository.updateUserByAdmin(UserId, data, workspaceId)
    } else {
      result = await this.userRepository.updateUserBySuperAdmin(UserId, data)
    }
    const { password, password_changed_at, ...safeRes } = result

    return SuccessResponse('Update user successful', safeRes)
  }

  async deleteUser(UserId: string, body: UserDeleteType, role: string, workspaceId: string) {
    if (!isUuid(UserId)) {
      throw WrongUserIdError
    }
    if (!body.status) {
      throw MissingStatusError
    }
    let result
    if (role === RoleName.SuperAdmin) {
      result = await this.userRepository.deleteUserBySuperAdmim(UserId, body.status)
    } else {
      // Kiểm tra user có thuộc workspace không
      const userInWorkspace = await this.userRepository.checkUserInWorkspace(UserId, workspaceId)
      if (!userInWorkspace) {
        throw UserNotFoundInWorkSpace
      }
      result = await this.userRepository.deleteUserByAdmin(UserId, workspaceId)
    }
    return SuccessResponse('Change user status successful', result)
  }
}

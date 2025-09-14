import { Injectable } from '@nestjs/common'
import {
  EmailAlreadyExistsError,
  GetAllUsersError,
  GetUsersByIdError,
  UserEmailUpdateNotAllowedError,
  UserNotFoundInWorkSpace,
  UserPermissionDeniedError,
  UserRoleNotFoundError,
  WrongUserIdError,
} from 'src/routes/user/user.errors'
import { UserCreateType, UserDeleteType, UserUpdateType } from 'src/routes/user/user.model'
import { UserRepository } from 'src/routes/user/user.repo'
import { RoleName } from 'src/shared/constants/role.constant'
import { HashingService } from 'src/shared/services/hashing.service'
import { SuccessResponse } from 'src/shared/sucess'
import { validate as isUuid } from 'uuid'

// 👉 Tóm gọn flow cơ bản:
//  Authorize(Guard) → Validate (Zod DTO) → Transform (Service) → Business checks (Service) → Persist (DB) (Repository) → Response (Service)

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
  ) {}

  async getAllUsers(role: string, workspaceId: string) {
    let result
    if (role === RoleName.Admin) {
      result = await this.userRepository.getAllUsersByWorkspaceId(workspaceId)
    } else if (role === RoleName.SuperAdmin) {
      result = await this.userRepository.getAllUsers()
    } else {
      throw UserPermissionDeniedError
    }

    if (!result) {
      throw GetAllUsersError
    }

    return SuccessResponse('Get all users successful', result)
  }

  async getMe(userId: string) {
    const result = await this.userRepository.getUserById(userId)
    if (!result) {
      throw GetUsersByIdError
    }

    return SuccessResponse('Get my profile successful', result)
  }

  async getUserById(UserId: string) {
    if (!isUuid(UserId)) {
      throw WrongUserIdError
    }

    const result = await this.userRepository.getUserById(UserId)
    if (!result) {
      throw GetUsersByIdError
    }

    return SuccessResponse('Get user by ID successful', result)
  }

  // create user là hệ thống tự tạo 1 randomw password
  // rồi gửi mail cho user (Duy làm phần này)
  async createUser(data: UserCreateType, role: string, workspaceId: string) {
    if (await this.userRepository.getUserByEmail(data.email)) {
      throw EmailAlreadyExistsError
    }

    const isValidRole = await this.userRepository.getRoleById(+data.role_id)
    if (!isValidRole) {
      throw UserRoleNotFoundError
    }

    if (data.password) {
      const hashedPassword = await this.hashingService.hash(data.password)
      data.password = hashedPassword
    }

    let result
    if (role === RoleName.Admin) {
      if (isValidRole.role === RoleName.ProjectManager || isValidRole.role === RoleName.Employee) {
        result = await this.userRepository.createUserForAdmin(data, workspaceId)
      } else throw UserPermissionDeniedError
    } else {
      result = await this.userRepository.createUserForSuperAdmin(data)
    }
    const { password, password_changed_at, ...safeRes } = result // check lại
    return SuccessResponse('Create user successful', safeRes)
  }

  async updateUser(UserId: string, data: UserUpdateType, role: string, workspaceId: string) {
    if (!isUuid(UserId)) {
      throw WrongUserIdError
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
      result = await this.userRepository.updateUserByAdmin(UserId, data, workspaceId)
    } else {
      result = await this.userRepository.updateUserBySuperAdmin(UserId, data)
    }

    return SuccessResponse('Update user successful', result)
  }

  async deleteUser(UserId: string, body: UserDeleteType, role: string, workspaceId: string) {
    if (!isUuid(UserId)) {
      throw WrongUserIdError
    }

    let result
    if (role === RoleName.SuperAdmin) {
      result = await this.userRepository.deleteUserBySuperAdmim(UserId, body.status)
    } else {
      result = await this.userRepository.deleteUserByAdmin(UserId, workspaceId)
    }

    return SuccessResponse('Change user status successful', result)
  }

  async checkUserInWorkspace(userId: string, workspaceId: string) {
    const result = await this.userRepository.checkUserInWorkspace(userId, workspaceId)
    if (!result) {
      throw UserNotFoundInWorkSpace
    }
    return true
  }
}

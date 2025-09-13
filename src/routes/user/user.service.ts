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
import { UserStatusType } from 'src/shared/constants/auth.constant'   // dư import
import { RoleName } from 'src/shared/constants/role.constant'
import { UserType } from 'src/shared/models/shared-user.model'
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
  ) { }

  // check lại 
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

  // chỗ này nên sử dụng userRepo bỏ trường password, password_changed_at
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

    // check lại nha, gắn ngược lại luôn thì theo t không ổn
    // nên có 1 const để chứa giá trị đã hash
    data.password = await this.hashingService.hash(data.password)

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

  // check lại phần nhận vô nên khai báo type/interface
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

    // xài zod validate body luôn
    // nếu có email trong body thì throw lỗi
    // dùng .strict() trong zod
    // test with strict and no strict xem zod có bắt lỗi ko
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
      // Mắc gì vô tới đây rồi mới check =))


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
    // xài zod validate body luôn
    // nếu ko có status trong body thì throw lỗi
    // dùng .strict() trong zod
    if (!body.status) {
      throw MissingStatusError
    }

    let result
    if (role === RoleName.SuperAdmin) {
      result = await this.userRepository.deleteUserBySuperAdmim(UserId, body.status)
    } else {
      // Nên validate trước qua decorator hoặc các guard nhé
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

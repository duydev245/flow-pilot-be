import { Injectable, Logger } from '@nestjs/common'
import {
  EmailAlreadyExistsError,
  GetAllUsersError,
  GetUsersByIdError,
  UserEmailUpdateNotAllowedError,
  UserNotFoundInWorkSpace,
  UserPermissionDeniedError,
  UserRoleNotFoundError,
  WorkspaceRequiredError,
  WrongUserIdError,
} from 'src/routes/user/user.errors'
import { UserCreateType, UserDeleteType, UserUpdateType } from 'src/routes/user/user.model'
import { generateRandomPassword } from 'src/shared/helpers'
import { UserRepository } from 'src/routes/user/user.repo'
import { RoleName } from 'src/shared/constants/role.constant'
import { HashingService } from 'src/shared/services/hashing.service'
import { SuccessResponse } from 'src/shared/sucess'
import { validate as isUuid } from 'uuid'
import { EmailService } from 'src/shared/services/email.service'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'

// 👉 Tóm gọn flow cơ bản:
//  Authorize(Guard) → Validate (Zod DTO) → Transform (Service) → Business checks (Service) → Persist (DB) (Repository) → Response (Service)

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
    private readonly emailService: EmailService,
    private readonly sharedUserRepository: SharedUserRepository,
  ) { }

  async getAllUsers(role: string, workspaceId: string) {
    let result: any[]
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
    const result = await this.sharedUserRepository.findUnique({ id: userId })

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

  async createUser(data: UserCreateType, actorRole: string) {
    try {
      // Kiểm tra email đã tồn tại chưa
      if (await this.userRepository.getUserByEmail(data.email)) {
        throw EmailAlreadyExistsError;
      }

      // Kiểm tra role_id có hợp lệ không
      const isValidRole = await this.userRepository.getRoleById(data.role_id);
      if (!isValidRole) {
        throw UserRoleNotFoundError;
      }

      // Kiểm tra quyền tạo user
      if (actorRole === RoleName.Admin) {
        if (
          isValidRole.role !== RoleName.ProjectManager &&
          isValidRole.role !== RoleName.Employee
        ) {
          throw UserPermissionDeniedError;
        }

        if (!data.workspace_id) {
          throw WorkspaceRequiredError;
        }
      }

      // Luôn tạo password random, hash rồi truyền vào repo
      const rawPassword = generateRandomPassword();
      const hashedPassword = await this.hashingService.hash(rawPassword);

      // Tạo object mới có password
      const dataWithPassword = { ...data, password: hashedPassword };
      const result = await this.userRepository.createUser(dataWithPassword);

      // Có thể gửi mail chứa rawPassword cho user ở đây nếu cần
      await this.emailService.sendNewAccountEmail({
        email: data.email,
        name: data.name,
        password: rawPassword,
      });

      return SuccessResponse('Create user successful', result);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async updateUser(UserId: string, data: UserUpdateType, actorRole: string) {
    if (!isUuid(UserId)) {
      throw WrongUserIdError
    }

    if (!data.workspace_id) {
      throw WorkspaceRequiredError;
    }

    let isValidRole: any
    if (data.role_id) {
      isValidRole = await this.userRepository.getRoleById(+data.role_id)

      if (!isValidRole) {
        throw UserRoleNotFoundError
      }

      if (
        actorRole === RoleName.Admin &&
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

    const result = await this.userRepository.updateUser(UserId, data)

    return SuccessResponse('Update user successful', result)
  }

  async deleteUser(UserId: string, body: UserDeleteType) {
    if (!isUuid(UserId)) {
      throw WrongUserIdError
    }

    await this.userRepository.deleteUser(UserId, body.status)

    return SuccessResponse('Delete user successful')
  }

  async checkUserInWorkspace(userId: string, workspaceId: string) {
    const result = await this.userRepository.checkUserInWorkspace(userId, workspaceId)
    if (!result) {
      throw UserNotFoundInWorkSpace
    }
    return true
  }
}

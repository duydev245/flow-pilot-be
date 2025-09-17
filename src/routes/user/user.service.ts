import { Injectable, Logger } from '@nestjs/common'
import {
  EmailAlreadyExistsError,
  GetAllUsersError,
  GetUsersByIdError,
  MissingStatusError,
  SuperAdminAccountException,
  UserEmailUpdateNotAllowedError,
  UserNotFoundInWorkSpace,
  UserPermissionDeniedError,
  UserRoleNotFoundError,
  WorkspaceRequiredError,
  WrongUserIdError,
} from 'src/routes/user/user.errors'
import { UserCreateByAdminType, UserCreateType, UserDeleteType, UserUpdateByAdminType, UserUpdateType } from 'src/routes/user/user.model'
import { generateRandomPassword } from 'src/shared/helpers'
import { UserRepository } from 'src/routes/user/user.repo'
import { RoleName } from 'src/shared/constants/role.constant'
import { HashingService } from 'src/shared/services/hashing.service'
import { SuccessResponse } from 'src/shared/sucess'
import { validate as isUuid } from 'uuid'
import { EmailService } from 'src/shared/services/email.service'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'

// 👉 Tóm gọn flow cơ bản:
//  Authorize(Guard) → Validate (Zod DTO) → Transform (Service) → Business checks (Service) → Persist (DB) (Repository) → Response (Service)

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly hashingService: HashingService,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly sharedRoleRepository: SharedRoleRepository,
  ) { }

  async isSuperAdminAccount(userId: string) {
    const user = await this.sharedUserRepository.findUniqueWithRole({ id: userId })
    if (user && user.role.role === RoleName.SuperAdmin) {
      return true
    }
    return false
  }

  // delete user (soft delete)
  async deleteUser(userId: string, body: UserDeleteType) {
    console.log("🚀 ~ UserService ~ deleteUser ~ body:", body)
    try {
      const { status } = body;

      if (!isUuid(userId)) {
        throw WrongUserIdError
      }

      if (!status) {
        throw MissingStatusError;
      }

      if (await this.isSuperAdminAccount(userId)) {
        throw SuperAdminAccountException;
      }

      await this.sharedUserRepository.update({ id: userId }, { status })

      return SuccessResponse('Delete user successful')
    } catch (error) {
      this.logger.error(error.message)
      throw error;
    }
  }

  // profile
  async getMe(userId: string) {
    try {
      const result = await this.userRepository.getUserById(userId)

      return SuccessResponse('Get my profile successful', result)
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  // Super admin routes
  async getAllUsersBySuperAdmin(actorId: string) {
    try {
      const result = await this.userRepository.getAllUsers(actorId)
      return SuccessResponse('Get all users successful', result)
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async getUserBySuperAdmin(UserId: string) {
    try {
      if (!isUuid(UserId)) {
        throw WrongUserIdError
      }

      if (await this.isSuperAdminAccount(UserId)) {
        throw SuperAdminAccountException;
      }

      const result = await this.userRepository.getUserById(UserId)

      return SuccessResponse('Get user by ID successful', result)
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async createUserBySuperAdmin(data: UserCreateType) {
    try {
      const { email, name, role_id, workspace_id } = data

      if (!workspace_id) {
        throw WorkspaceRequiredError;
      }

      // Kiểm tra email đã tồn tại chưa
      if (await this.sharedUserRepository.findUnique({ email })) {
        throw EmailAlreadyExistsError;
      }

      // Kiểm tra role_id có hợp lệ không
      const isValidRole = await this.sharedRoleRepository.findUnique({ id: role_id });
      if (!isValidRole) {
        throw UserRoleNotFoundError;
      }

      // Luôn tạo password random, hash rồi truyền vào repo
      const rawPassword = generateRandomPassword();
      const hashedPassword = await this.hashingService.hash(rawPassword);

      // Tạo object mới có password
      const dataWithPassword = { ...data, password: hashedPassword };
      await this.userRepository.createUser(dataWithPassword);

      // Có thể gửi mail chứa rawPassword cho user ở đây nếu cần
      await this.emailService.sendNewAccountEmail({
        email,
        name,
        password: rawPassword,
      });

      return SuccessResponse('Create user successful');
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async updateUserBySuperAdmin(userId: string, data: UserUpdateType) {
    try {
      if (await this.isSuperAdminAccount(userId)) {
        throw SuperAdminAccountException;
      }

      const result = await this.sharedUserRepository.update({ id: userId }, data)

      return SuccessResponse('Update user successful', result)
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  // Admin routes
  async getAllUsersByAdmin(actorId: string, workspaceId: string) {
    try {
      const result = await this.userRepository.getAllUsersByWorkspaceId(actorId, workspaceId)
      return SuccessResponse('Get all users successful', result)
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async getUserByAdmin(userId: string, workspaceId: string) {
    try {
      if (await this.isSuperAdminAccount(userId)) {
        throw SuperAdminAccountException
      }

      const result = await this.userRepository.getUserByAdmin({ id: userId, workspace_id: workspaceId })
      return SuccessResponse('Get user by ID successful', result)
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async createUserByAdmin(data: UserCreateByAdminType, workspaceId: string) {
    try {
      const { email, name, role_id } = data

      // Kiểm tra email đã tồn tại chưa
      if (await this.sharedUserRepository.findUnique({ email })) {
        throw EmailAlreadyExistsError;
      }

      // Kiểm tra role_id có hợp lệ không
      const isValidRole = await this.sharedRoleRepository.findUnique({ id: role_id });
      if (!isValidRole) {
        throw UserRoleNotFoundError;
      }

      // Kiểm tra quyền tạo user
      if (
        isValidRole.role !== RoleName.ProjectManager &&
        isValidRole.role !== RoleName.Employee
      ) {
        throw UserPermissionDeniedError;
      }

      // Luôn tạo password random, hash rồi truyền vào repo
      const rawPassword = generateRandomPassword();
      const hashedPassword = await this.hashingService.hash(rawPassword);

      // Tạo object mới có password
      const dataWithPassword = { ...data, password: hashedPassword, workspace_id: workspaceId };
      await this.userRepository.createUser(dataWithPassword);

      // Có thể gửi mail chứa rawPassword cho user ở đây nếu cần
      await this.emailService.sendNewAccountEmail({
        email,
        name,
        password: rawPassword,
      });

      return SuccessResponse('Create user successful');
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async updateUserByAdmin(userId: string, workspaceId: string, data: UserUpdateByAdminType) {
    try {
      if (await this.isSuperAdminAccount(userId)) {
        throw SuperAdminAccountException;
      }

      if (data.role_id) {
        const isValidRole = await this.sharedRoleRepository.findUnique({ id: data.role_id });

        if (!isValidRole) {
          throw UserRoleNotFoundError;
        }

        if (
          isValidRole.role !== RoleName.ProjectManager &&
          isValidRole.role !== RoleName.Employee
        ) {
          throw UserPermissionDeniedError;
        }
      }

      const result = await this.userRepository.updateUserByAdmin({ id: userId, workspace_id: workspaceId }, data)

      return SuccessResponse('Update user successful', result)
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

}

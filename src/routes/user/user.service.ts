import { Injectable, Logger } from '@nestjs/common'
import {
  EmailAlreadyExistsError,
  MissingStatusError,
  SuperAdminAccountException,
  UserPermissionDeniedError,
  UserRoleNotFoundError,
  WorkspaceRequiredError,
  WrongUserIdError,
} from 'src/routes/user/user.errors'
import { ActiveUserType, UserCreateByAdminType, UserCreateType, UserUpdateByAdminType, UserUpdateProfileType, UserUpdateType } from 'src/routes/user/user.model'
import { generateRandomPassword } from 'src/shared/helpers'
import { UserRepository } from 'src/routes/user/user.repo'
import { RoleName } from 'src/shared/constants/role.constant'
import { HashingService } from 'src/shared/services/hashing.service'
import { SuccessResponse } from 'src/shared/sucess'
import { validate as isUuid } from 'uuid'
import { EmailService } from 'src/shared/services/email.service'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { S3StorageService } from 'src/shared/services/s3-storage.service'
import { InvalidFile } from '../file/file.error'
import path from 'path'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_EXT = ['.png', '.jpg', '.jpeg']

function getExtension(filename: string) {
  const ext = path.extname(filename || '').toLowerCase()
  return ext
}

function sanitizeFilename(name: string, maxLen = 255) {
  if (!name) return 'file'
  // Normalize Unicode, remove nulls and control characters, replace path separators
  let s = name.normalize('NFC')
  s = s.replace(/\0/g, '')
  // remove control chars by filtering codepoints (avoid problematic regex ranges)
  s = Array.from(s)
    .filter(ch => {
      const code = ch.charCodeAt(0)
      return code > 31 && code !== 127
    })
    .join('')
  s = s.replace(/\//g, '_').replace(/\\/g, '_')
  s = s.trim()
  if (s.length > maxLen) s = s.slice(0, maxLen)
  return s || 'file'
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly hashingService: HashingService,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly sharedRoleRepository: SharedRoleRepository,
    private readonly s3: S3StorageService,
  ) { }

  validateFile(file: Express.Multer.File) {
    if (!file) throw InvalidFile
    if (file.size > MAX_FILE_SIZE) throw InvalidFile
    const ext = getExtension(file.originalname)
    if (!ALLOWED_EXT.includes(ext)) throw InvalidFile
  }

  async isSuperAdminAccount(userId: string) {
    const user = await this.sharedUserRepository.findUniqueWithRole({ id: userId })
    if (user && user.role.role === RoleName.SuperAdmin) {
      return true
    }
    return false
  }

  async activeUser(userId: string, body: ActiveUserType) {
    try {
      const { status } = body;

      if (!isUuid(userId)) {
        throw WrongUserIdError;
      }

      if (!status) {
        throw MissingStatusError;
      }

      await this.sharedUserRepository.update({ id: userId }, { status })

      return SuccessResponse('User activated successfully')
    } catch (error) {
      this.logger.error(error.message)
      throw error;
    }
  }

  // delete user (soft delete)
  async deleteUser(userId: string) {
    try {
      if (!isUuid(userId)) {
        throw WrongUserIdError
      }

      if (await this.isSuperAdminAccount(userId)) {
        throw SuperAdminAccountException;
      }

      await this.sharedUserRepository.update({ id: userId }, { status: 'inactive' })

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

  async updateProfile(avatar: Express.Multer.File, userId: string, data: UserUpdateProfileType) {
    this.validateFile(avatar);
    let avatar_url: string;

    try {
      const res = await this.s3.uploadFile(avatar, 'avatars')
      avatar_url = res.url

      await this.sharedUserRepository.update({ id: userId }, { ...data, avatar_url })
      return SuccessResponse('Update profile successful')
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  // Super admin routes
  async getAllUsersBySuperAdmin(actorId: string, page: number = 1, pageSize: number = 10) {
    try {
      const result = await this.userRepository.getAllUsers(actorId, page, pageSize)
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
      const result = await this.userRepository.updateUserBySuperAdmin(userId, data)

      return SuccessResponse('Update user successful', result)
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  // Admin routes
  async getAllUsersByAdmin(actorId: string, workspaceId: string, page: number = 1, pageSize: number = 10) {
    try {
      const result = await this.userRepository.getAllUsersByWorkspaceId(actorId, workspaceId, page, pageSize)
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

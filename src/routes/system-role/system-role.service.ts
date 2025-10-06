import { Injectable, Logger } from '@nestjs/common'
import { SystemRoleRepository } from './system-role.repo'
import { CreateSystemRoleBodyType, UpdateSystemRoleType } from './system-role.model'
import {
  SystemRoleNotFoundError,
  SystemRoleExistsError,
  InvalidSystemRoleIdError,
  SystemRoleInUseError,
} from './system-role.error'
import { SuccessResponse } from 'src/shared/sucess'

@Injectable()
export class SystemRoleService {
  private readonly logger = new Logger(SystemRoleService.name)

  constructor(private readonly systemRoleRepository: SystemRoleRepository) { }

  async getAll(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit
      const [roles, total] = await Promise.all([
        this.systemRoleRepository.findMany({
          skip,
          take: limit,
          orderBy: { id: 'asc' },
        }),
        this.systemRoleRepository.count(),
      ])

      const result = {
        data: roles,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }

      return SuccessResponse('System roles retrieved successfully', result)
    } catch (error) {
      this.logger.error(`Error getting system roles: ${error.message}`)
      throw error
    }
  }

  async getById(id: number) {
    try {
      if (!id || isNaN(id)) {
        throw InvalidSystemRoleIdError
      }

      const role = await this.systemRoleRepository.findUnique({ id })

      if (!role) {
        throw SystemRoleNotFoundError
      }

      return SuccessResponse('System role retrieved successfully', role)
    } catch (error) {
      this.logger.error(`Error getting system role by id: ${error.message}`)
      throw error
    }
  }

  async create(data: CreateSystemRoleBodyType) {
    try {
      // Check if role already exists
      const existingRole = await this.systemRoleRepository.findFirst({
        role: data.role.toUpperCase(),
      })

      if (existingRole) {
        throw SystemRoleExistsError
      }

      const role = await this.systemRoleRepository.create({
        role: data.role.toUpperCase(),
      })

      return SuccessResponse('System role created successfully', role)
    } catch (error) {
      this.logger.error(`Error creating system role: ${error.message}`)
      throw error
    }
  }

  async update(id: number, data: UpdateSystemRoleType) {
    try {
      if (!id || isNaN(id)) {
        throw InvalidSystemRoleIdError
      }

      // Check if role exists
      const existingRole = await this.systemRoleRepository.findUnique({ id })
      if (!existingRole) {
        throw SystemRoleNotFoundError
      }

      // If updating role name, check for duplicates
      if (data.role && data.role.toUpperCase() !== existingRole.role) {
        const duplicateRole = await this.systemRoleRepository.findFirst({
          role: data.role.toUpperCase(),
        })

        if (duplicateRole && duplicateRole.id !== id) {
          throw SystemRoleExistsError
        }
      }

      const updateData = data.role ? { role: data.role.toUpperCase() } : {}
      const updatedRole = await this.systemRoleRepository.update({ id }, updateData)

      return SuccessResponse('System role updated successfully', updatedRole)
    } catch (error) {
      this.logger.error(`Error updating system role: ${error.message}`)
      throw error
    }
  }

  async delete(id: number) {
    try {
      if (!id || isNaN(id)) {
        throw InvalidSystemRoleIdError
      }

      // Check if role exists
      const role = await this.systemRoleRepository.findUnique({ id })
      if (!role) {
        throw SystemRoleNotFoundError
      }

      // Check if role is in use by users (you might need to add this method to repository)
      // For now, we'll skip this check, but it's recommended to implement it
      
      await this.systemRoleRepository.delete({ id })

      return SuccessResponse('System role deleted successfully')
    } catch (error) {
      this.logger.error(`Error deleting system role: ${error.message}`)
      throw error
    }
  }
}

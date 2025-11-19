import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'

export const SystemRoleNotFoundError = new NotFoundException({
  code: 'SYSTEM_ROLE_NOT_FOUND',
  message: 'System role not found',
})

export const SystemRoleExistsError = new ConflictException({
  code: 'SYSTEM_ROLE_EXISTS',
  message: 'System role already exists',
})

export const InvalidSystemRoleIdError = new BadRequestException({
  code: 'INVALID_SYSTEM_ROLE_ID',
  message: 'Invalid system role ID format',
})

export const SystemRoleInUseError = new BadRequestException({
  code: 'SYSTEM_ROLE_IN_USE',
  message: 'Cannot delete system role that is currently assigned to users',
})

export const DefaultSystemRoleError = new BadRequestException({
  code: 'DEFAULT_SYSTEM_ROLE_ERROR',
  message: 'Cannot modify or delete default system roles',
})
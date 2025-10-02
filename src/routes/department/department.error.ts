import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common'

export const DepartmentNotFoundError = new NotFoundException({
  code: 'DEPARTMENT_NOT_FOUND',
  message: 'Department not found',
})

export const DepartmentNameExistsError = new ConflictException({
  code: 'DEPARTMENT_NAME_EXISTS',
  message: 'Department name already exists in this workspace',
})

export const InvalidDepartmentIdError = new BadRequestException({
  code: 'INVALID_DEPARTMENT_ID',
  message: 'Invalid department ID format',
})

export const WorkspaceNotFoundError = new NotFoundException({
  code: 'WORKSPACE_NOT_FOUND',
  message: 'Workspace not found',
})

export const DepartmentAccessDeniedError = new ForbiddenException({
  code: 'DEPARTMENT_ACCESS_DENIED',
  message: 'You do not have permission to access this department',
})

export const DepartmentHasUsersError = new BadRequestException({
  code: 'DEPARTMENT_HAS_USERS',
  message: 'Cannot delete department with active users. Please reassign users first.',
})

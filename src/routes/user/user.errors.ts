import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'

export const GetAllUsersError = new InternalServerErrorException({
  code: 'INTERNAL_SERVER_ERROR',
  message: 'Cannot get all users',
})
export const GetUsersByIdError = new InternalServerErrorException({
  code: 'INTERNAL_SERVER_ERROR',
  message: 'Cannot get users by id',
})
export const WrongUserIdError = new BadRequestException({
  code: 'BAD_REQUEST',
  message: 'Wrong user id',
})
export const EmailAlreadyExistsError = new ConflictException({
  code: 'CONFLICT',
  message: 'Email already exists',
})
export const UserRoleNotFoundError = new NotFoundException({
  code: 'NOT_FOUND_EXCEPTION',
  message: 'User role not found',
})
export const UserEmailUpdateNotAllowedError = new BadRequestException({
  code: 'BAD_REQUEST',
  message: 'cannot update email address',
})
export const UserPermissionDeniedError = new ForbiddenException({
  code: 'FORBIDDEN_EXCEPTION',
  message: 'You do not have permission to create this role',
})
export const UserNotFoundInWorkSpace = new NotFoundException({
  code: 'NOT_FOUND_EXCEPTION',
  message: 'User not found in this workspace',
})
export const MissingStatusError = new BadRequestException({
  code: 'BAD_REQUEST',
  message: 'Missing status field',
})
import { UnauthorizedException, UnprocessableEntityException } from "@nestjs/common"

// Email related errors
export const EmailAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.EmailAlreadyExists',
    path: 'email',
  },
])

export const EmailNotFoundException = new UnprocessableEntityException([
  {
    message: 'Error.EmailNotFound',
    path: 'email',
  },
])

// Auth token related errors
export const RefreshTokenAlreadyUsedException = new UnauthorizedException('Error.RefreshTokenAlreadyUsed')
export const UnauthorizedAccessException = new UnauthorizedException('Error.UnauthorizedAccess')
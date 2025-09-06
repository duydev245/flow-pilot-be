import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from "@nestjs/common"

export const NotFoundRecordException = new NotFoundException('Error.NotFound')

export const InvalidPasswordException = new UnauthorizedException({ code: 'AUTH_INVALID_PASSWORD', message: 'Invalid password' })

export const VersionConflictException = new ConflictException('Error.VersionConflict')

export const UnauthorizedAccessException = new UnauthorizedException({ code: 'UNAUTHORIZED_ACCESS', message: 'Unauthorized Access' })

export const AccessTokenRequiredException = new BadRequestException({ code: 'ACCESS_TOKEN_IS_REQUIRED', message: 'Access Token is required' })

export const InvalidExpiredAccessTokenException = new UnauthorizedException({ code: 'INVALID_EXPIRED_ACCESS_TOKEN', message: 'Invalid or expired access token' })

export const RefreshTokenRequiredException = new BadRequestException({ code: 'REFRESH_TOKEN_IS_REQUIRED', message: 'Refresh Token is required' })

export const InvalidExpiredRefreshTokenException = new UnauthorizedException({ code: 'INVALID_EXPIRED_REFRESH_TOKEN', message: 'Invalid or expired refresh token' })

export const UserNotFoundException = new UnauthorizedException({ code: 'AUTH_INVALID_USER', message: 'User is not found!' })

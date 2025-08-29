import { ConflictException, NotFoundException, UnauthorizedException } from "@nestjs/common"

export const NotFoundRecordException = new NotFoundException('Error.NotFound')

export const InvalidPasswordException = new UnauthorizedException({ code: 'AUTH_INVALID_PASSWORD', message: 'Invalid password' })

export const VersionConflictException = new ConflictException('Error.VersionConflict')
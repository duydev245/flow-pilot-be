import { UnauthorizedException, UnprocessableEntityException } from "@nestjs/common"

// Email related errors
export const EmailAlreadyExistsException = new UnprocessableEntityException(
    {
        message: 'Error.EmailAlreadyExists',
        path: 'email',
    }
)

export const EmailNotFoundException = new UnauthorizedException({ code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid email or password' })

// Auth token related errors
export const RefreshTokenAlreadyUsedException = new UnauthorizedException({ code: 'AUTH_REFRESH_TOKEN_ALREADY_USED', message: 'Refresh Token Already Used' })

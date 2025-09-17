import { ForbiddenException, UnauthorizedException, UnprocessableEntityException } from "@nestjs/common"

// Email related errors
export const EmailAlreadyExistsException = new UnprocessableEntityException(
    {
        message: 'Error.EmailAlreadyExists',
        path: 'email',
    }
)

export const InvalidCredentialsException = new UnauthorizedException({ code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid email or password' })

export const EmailNotFoundException = new UnauthorizedException({ code: 'AUTH_EMAIL_NOT_FOUND', message: 'Email not found' })

// Auth token related errors
export const RefreshTokenAlreadyUsedException = new UnauthorizedException({ code: 'AUTH_REFRESH_TOKEN_ALREADY_USED', message: 'Refresh Token Already Used' })

export const FirstLoginDefaultPasswordException = new ForbiddenException({ code: 'AUTH_FIRST_LOGIN_DEFAULT_PASSWORD', message: 'You must change your default password before using this feature' })
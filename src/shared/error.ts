import { BadRequestException, ConflictException, ForbiddenException, NotFoundException, UnauthorizedException } from "@nestjs/common"

export const NotFoundRecordException = new NotFoundException('Error.NotFound')

export const InvalidPasswordException = new UnauthorizedException({ code: 'AUTH_INVALID_PASSWORD', message: 'Invalid password' })

export const VersionConflictException = new ConflictException('Error.VersionConflict')

export const UnauthorizedAccessException = new UnauthorizedException({ code: 'UNAUTHORIZED_ACCESS', message: 'Unauthorized Access' })

export const AccessTokenRequiredException = new BadRequestException({ code: 'ACCESS_TOKEN_IS_REQUIRED', message: 'Access Token is required' })

export const InvalidExpiredAccessTokenException = new UnauthorizedException({ code: 'INVALID_EXPIRED_ACCESS_TOKEN', message: 'Invalid or expired access token' })

export const RefreshTokenRequiredException = new BadRequestException({ code: 'REFRESH_TOKEN_IS_REQUIRED', message: 'Refresh Token is required' })

export const InvalidExpiredRefreshTokenException = new UnauthorizedException({ code: 'INVALID_EXPIRED_REFRESH_TOKEN', message: 'Invalid or expired refresh token' })

export const UserNotFoundException = new UnauthorizedException({ code: 'INVALID_USER', message: 'User is not found!' })

export const InvalidOTPException = new UnauthorizedException({ code: 'INVALID_OTP', message: 'Invalid OTP' })

export const ExpiredOTPException = new UnauthorizedException({ code: 'EXPIRED_OTP', message: 'Expired OTP' })

export const ForbiddenResourceException = new ForbiddenException({ code: 'FORBIDDEN_RESOURCE', message: 'You do not have permission to access this resource' })

export const InvalidAPIKeyException = new UnauthorizedException({ code: 'INVALID_API_KEY', message: 'Invalid API Key' })

export const PaymentApiKeyRequiredException = new BadRequestException({ code: 'PAYMENT_API_KEY_IS_REQUIRED', message: 'Payment API Key is required' })

export const NotificationErrors = {
    NotFound: {
        code: 'NOTIFICATION_NOT_FOUND',
        message: 'Notification not found.'
    },
    CreateFailed: {
        code: 'NOTIFICATION_CREATE_FAILED',
        message: 'Failed to create notification.'
    },
    UpdateFailed: {
        code: 'NOTIFICATION_UPDATE_FAILED',
        message: 'Failed to update notification.'
    },
    DeleteFailed: {
        code: 'NOTIFICATION_DELETE_FAILED',
        message: 'Failed to delete notification.'
    },
    MarkAsReadFailed: {
        code: 'NOTIFICATION_MARK_AS_READ_FAILED',
        message: 'Failed to mark notification as read.'
    },
    MarkAllAsReadFailed: {
        code: 'NOTIFICATION_MARK_ALL_AS_READ_FAILED',
        message: 'Failed to mark all notifications as read.'
    },
    NoNotificationsToMarkAsRead: {
        code: 'NOTIFICATION_NO_NOTIFICATIONS_TO_MARK_AS_READ',
        message: 'No notifications to mark as read.'
    }
};

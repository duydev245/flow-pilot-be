import { NotFoundException, BadRequestException } from '@nestjs/common'

export const ConsultationRequestNotFound = new NotFoundException({
	code: 'NOT_FOUND_EXCEPTION',
	message: 'Consultation request not found',
})

export const PackageNotFound = new NotFoundException({
	code: 'NOT_FOUND_EXCEPTION',
	message: 'Package not found',
})

export const EmailNotificationError = new BadRequestException({
	code: 'BAD_REQUEST_EXCEPTION',
	message: 'Failed to send notification emails',
})

export const EmailExistsError = new BadRequestException({
	code: 'BAD_REQUEST_EXCEPTION',
	message: 'Email already exists',
})

export const ValidationError = (errors: any) =>
	new BadRequestException({ code: 'VALIDATION_EXCEPTION', message: 'Validation error', errors })
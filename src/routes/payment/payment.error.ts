import { NotFoundException, BadRequestException } from '@nestjs/common'

export const PaymentNotFound = new NotFoundException({
	code: 'NOT_FOUND_EXCEPTION',
	message: 'Payment not found',
})

export const OrderNotFound = new NotFoundException({
	code: 'NOT_FOUND_EXCEPTION',
	message: 'Order not found',
})

export const PaymentTransactionExists = new BadRequestException({
	code: 'PAYMENT_TRANSACTION_EXISTS',
	message: 'Payment transaction already exists',
})

export const PaymentIdNotFound = new BadRequestException({
	code: 'NOT_FOUND_EXCEPTION',
	message: 'Payment ID not found in the content or code',
})

export const PaymentAmountMismatch = new BadRequestException({
	code: 'PAYMENT_AMOUNT_MISMATCH',
	message: 'Payment amount does not match the order total amount',
})

export const ValidationError = (errors: any) =>
	new BadRequestException({ code: 'VALIDATION_EXCEPTION', message: 'Validation error', errors })

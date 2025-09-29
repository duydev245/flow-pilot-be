(function(){})()
import { NotFoundException, BadRequestException } from '@nestjs/common'

export const OrderNotFound = new NotFoundException({
	code: 'NOT_FOUND_EXCEPTION',
	message: 'Order not found',
})

export const PackageNotFound = new NotFoundException({
	code: 'NOT_FOUND_EXCEPTION',
	message: 'Package not found',
})

export const WorkspaceNotFound = new NotFoundException({
	code: 'NOT_FOUND_EXCEPTION',
	message: 'Workspace not found',
})

export const ValidationError = (errors: any) =>
	new BadRequestException({ code: 'VALIDATION_EXCEPTION', message: 'Validation error', errors })


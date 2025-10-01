import { Injectable, Logger } from '@nestjs/common'
import { PaymentRepository } from './payment.repo'
import { SharedOrderRepository } from 'src/shared/repositories/shared-order.repo'
import { CreatePaymentRequestType, CreatePaymentType, WebhookPaymentBodyType } from './payment.model'
import { SuccessResponse } from 'src/shared/sucess'
import { PaymentNotFound, OrderNotFound, PaymentTransactionExists, PaymentIdNotFound, PaymentAmountMismatch } from './payment.error'
import { PaymentStatus, PREFIX_PAYMENT_CODE } from 'src/shared/constants/payment.constant'
import { EmailService } from 'src/shared/services/email.service'
import { OrderStatus } from 'src/shared/constants/order.constant'
import { format } from 'date-fns'

@Injectable()
export class PaymentService {
	private readonly logger = new Logger(PaymentService.name)

	constructor(
		private readonly paymentRepository: PaymentRepository,
		private readonly sharedOrderRepository: SharedOrderRepository,
		private readonly emailService: EmailService,
	) { }

	async getAll({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
		try {
			const result = await this.paymentRepository.getAll({ page, limit })
			return SuccessResponse('Get all payments successfully', result)
		} catch (error) {
			this.logger.error(error.message)
			throw error
		}
	}

	async getById(id: number) {
		try {
			const existing = await this.paymentRepository.getById(id)
			if (!existing) return PaymentNotFound
			return SuccessResponse('Get payment successfully', existing)
		} catch (error) {
			this.logger.error(error.message)
			throw error
		}
	}

	async create(body: CreatePaymentRequestType) {
		try {
			const { order_id } = body

			const orderExist = await this.sharedOrderRepository.findUniqueWithPackage({ id: order_id })
			if (!orderExist) return OrderNotFound

			const amount = orderExist.total_amount;

			const result = await this.paymentRepository.create({
				order_id,
				payment_date: new Date(),
				amount,
				status: PaymentStatus.pending,
			})

			// Send email to user
			await this.emailService.sendPaymentRequestEmail({
				email: orderExist.email,
				package_name: orderExist.package.name,
				order_id: orderExist.id,
				payment_id: result.id.toString(),
				amount: amount.toLocaleString(),
			})

			return SuccessResponse('Create payment successfully', result)
		} catch (error) {
			this.logger.error(error.message)
			throw error
		}
	}

	async update(id: number, body: any) {
		try {
			const existing = await this.paymentRepository.getById(id)
			if (!existing) return PaymentNotFound

			const result = await this.paymentRepository.update(id, body)
			return SuccessResponse('Update payment successfully', result)
		} catch (error) {
			this.logger.error(error.message)
			throw error
		}
	}

	async delete(id: number) {
		try {
			const existing = await this.paymentRepository.getById(id)
			if (!existing) return PaymentNotFound
			const result = await this.paymentRepository.delete(id)
			return SuccessResponse('Delete payment successfully', result)
		} catch (error) {
			this.logger.error(error.message)
			throw error
		}
	}

	async receive(body: WebhookPaymentBodyType) {
		try {
			const { id } = body
			// 0. Kiểm tra xem transaction có tồn tại không
			const existingTransaction = await this.paymentRepository.findUniqueTransaction({
				id
			})

			if (existingTransaction) {
				throw PaymentTransactionExists;
			}

			// 1. Kiểm tra nội dung chuyển khoản và tổng số tiền có khớp hay không
			const paymentId = body.code
				? Number(body.code.split(PREFIX_PAYMENT_CODE)[1])
				: Number(body.content?.split(PREFIX_PAYMENT_CODE)[1])

			if (isNaN(paymentId)) {
				throw PaymentIdNotFound;
			}

			const existingPayment = await this.paymentRepository.getById(paymentId)
			if (!existingPayment) {
				throw PaymentNotFound;
			}

			const { order_id } = existingPayment;
			const order = await this.sharedOrderRepository.findUniqueWithPackage({ id: order_id })

			if (!order) {
				throw OrderNotFound;
			}

			if (order.total_amount !== body.transferAmount) {
				throw PaymentAmountMismatch;
			}

			// 2. Thêm thông tin giao dịch vào DB
			const transaction = await this.paymentRepository.createTransaction(body)

			// 3. Cập nhật trạng thái payment và order
			await Promise.all([
				this.paymentRepository.update(paymentId, { status: PaymentStatus.success }),
				this.sharedOrderRepository.update({ id: order.id }, { status: OrderStatus.paid }),
				this.emailService.sendPaymentSuccessEmail({
					email: order.email,
					package_name: order.package.name,
					amount: order.total_amount.toLocaleString(),
					order_id: order.id,
					paid_at: format(new Date(transaction.transaction_date), 'dd/MM/yyyy HH:mm')
				})
			])

			return SuccessResponse('Receive payment successfully')
		} catch (error) {
			this.logger.error(error.message)
			throw error
		}
	}
}

import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { PaymentTransactionType, PaymentType, WebhookPaymentBodyType } from './payment.model'
import { PaymentAmountMismatch, PaymentIdNotFound, PaymentNotFound, PaymentTransactionExists } from './payment.error';
import { parse } from 'date-fns';
import { PaymentStatus, PREFIX_PAYMENT_CODE } from 'src/shared/constants/payment.constant';
import { OrderStatus } from 'src/shared/constants/order.constant';


@Injectable()
export class PaymentRepository {
	constructor(private readonly prismaService: PrismaService) { }

	async getAll({ page, limit }: { page: number; limit: number }) {
		const skip = (page - 1) * limit
		const [data, total] = await Promise.all([
			this.prismaService.payment.findMany({
				skip,
				take: limit,
				orderBy: { payment_date: 'desc' },
			}),
			this.prismaService.payment.count(),
		])
		return { data, total, page, limit }
	}

	async getById(id: number) {
		// cast to any to avoid generated prisma client type mismatches in this workspace
		return await this.prismaService.payment.findUnique({
			where: { id }
		})
	}

	async create(data: Pick<PaymentType, 'order_id' | 'payment_date' | 'amount' | 'status'>) {
		return await this.prismaService.payment.create({ data })
	}

	async update(id: number, body: Partial<PaymentType>) {
		return await this.prismaService.payment.update({
			where: {
				id
			},
			data: body
		})
	}

	async delete(id: number) {
		// for payments we hard delete
		return await this.prismaService.payment.delete({ where: { id } })
	}

	async createTransaction(body: WebhookPaymentBodyType): Promise<PaymentTransactionType> {
		let amount_in = 0
		let amount_out = 0

		if (body.transferType === 'in') {
			amount_in = body.transferAmount
		} else if (body.transferType === 'out') {
			amount_out = body.transferAmount
		}

		return await this.prismaService.paymentTransaction.create({
			data: {
				id: body.id,
				gateway: body.gateway,
				transaction_date: parse(body.transactionDate, 'yyyy-MM-dd HH:mm:ss', new Date()),
				account_number: body.accountNumber,
				sub_account: body.subAccount,
				amount_in,
				amount_out,
				accumulated: body.accumulated,
				code: body.code,
				transaction_content: body.content,
				reference_number: body.referenceCode,
				body: body.description,
			}
		})
	}

	async findUniqueTransaction(where: { id: number }) {
		return await this.prismaService.paymentTransaction.findUnique({ where })
	}

	async findUniqueWithOrder(where: { id: number }) {
		return await this.prismaService.payment.findUnique({
			where,
			include: {
				order: true
			}
		})
	}
}

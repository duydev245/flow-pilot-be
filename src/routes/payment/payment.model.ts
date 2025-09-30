import { PaymentStatus } from "src/shared/constants/payment.constant";
import z from "zod";

export const PaymentSchema = z.object({
	id: z.number(),
	email: z.email(),
	order_id: z.uuid(),
	payment_date: z.date(),
	amount: z.number(),
	status: z.enum([PaymentStatus.pending, PaymentStatus.success, PaymentStatus.failed, PaymentStatus.refunded]).default(PaymentStatus.pending),
	createdAt: z.date().default(new Date()),
	updatedAt: z.date().default(new Date()).optional(),
})

export const CreatePaymentRequestSchema = PaymentSchema
	.pick({ order_id: true, email: true })
	.strict()

export const CreatePaymentSchema = z.object({
	order_id: z.uuid(),
	email: z.email(),
	payment_date: z.date(),
	amount: z.number(),
	status: z.enum([PaymentStatus.pending, PaymentStatus.success, PaymentStatus.failed, PaymentStatus.refunded]),
}).strict()

export const UpdatePaymentSchema = CreatePaymentRequestSchema.partial()

export type PaymentType = z.infer<typeof PaymentSchema>
export type CreatePaymentRequestType = z.infer<typeof CreatePaymentRequestSchema>
export type CreatePaymentType = z.infer<typeof CreatePaymentSchema>
export type UpdatePaymentType = z.infer<typeof UpdatePaymentSchema>

export const PaymentTransactionSchema = z.object({
	id: z.number(),
	gateway: z.string(),
	transaction_date: z.date(),
	account_number: z.string().nullable(),
	sub_account: z.string().nullable(),
	amount_in: z.number(),
	amount_out: z.number(),
	accumulated: z.number(),
	code: z.string().nullable(),
	transaction_content: z.string().nullable(),
	reference_number: z.string().nullable(),
	body: z.string().nullable(),
	createdAt: z.date().default(new Date()),
})

/**
 * https://docs.sepay.vn/tich-hop-webhooks.html
 */

export const WebhookPaymentBodySchema = z.object({
	id: z.number(), // ID giao dịch trên SePay
	gateway: z.string(), // Brand name của ngân hàng
	transactionDate: z.string(), // Thời gian xảy ra giao dịch phía ngân hàng
	accountNumber: z.string().nullable(), // Số tài khoản ngân hàng
	code: z.string().nullable(), // Mã code thanh toán (sepay tự nhận diện dựa vào cấu hình tại Công ty -> Cấu hình chung)
	content: z.string().nullable(), // Nội dung chuyển khoản
	transferType: z.enum(['in', 'out']), // Loại giao dịch. in là tiền vào, out là tiền ra
	transferAmount: z.number(), // Số tiền giao dịch
	accumulated: z.number(), // Số dư tài khoản (lũy kế)
	subAccount: z.string().nullable(), // Tài khoản ngân hàng phụ (tài khoản định danh),
	referenceCode: z.string().nullable(), // Mã tham chiếu của tin nhắn sms
	description: z.string(), // Toàn bộ nội dung tin nhắn sms
})

export type PaymentTransactionType = z.infer<typeof PaymentTransactionSchema>
export type WebhookPaymentBodyType = z.infer<typeof WebhookPaymentBodySchema>

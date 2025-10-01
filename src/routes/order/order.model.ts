import { OrderStatus } from 'src/shared/constants/order.constant'
import { OrderSchema } from 'src/shared/models/shared-order.model'
import z from 'zod'

export const CreateOrderSchema = OrderSchema.pick({
	email: true,
	workspace_id: true,
	package_id: true,
})

export const UpdateOrderSchema = z.object({
	email: z.email().optional(),
	workspace_id: z.uuid().optional().nullable(),
	package_id: z.uuid().optional(),
	total_amount: z.number().optional(),
	status: z.enum([OrderStatus.pending, OrderStatus.paid, OrderStatus.canceled]).optional(),
})

export type CreateOrderType = z.infer<typeof CreateOrderSchema>
export type UpdateOrderType = z.infer<typeof UpdateOrderSchema>


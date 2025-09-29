import { OrderStatus } from 'src/shared/constants/order.constant'
import z from 'zod'

export const OrderSchema = z.object({
	id: z.uuid(),
	workspace_id: z.uuid().optional().nullable(),
	package_id: z.uuid(),
	total_amount: z.number(),
	created_at: z.date().default(new Date()),
	updated_at: z.date().optional(),
	status: z.enum([OrderStatus.pending, OrderStatus.confirmed, OrderStatus.canceled]).default(OrderStatus.pending),
})

export const CreateOrderSchema = OrderSchema.pick({
	workspace_id: true,
	package_id: true,
	total_amount: true
})

export const UpdateOrderSchema = z.object({
	workspace_id: z.uuid().optional().nullable(),
	package_id: z.uuid().optional(),
	total_amount: z.number().optional(),
	status: z.enum([OrderStatus.pending, OrderStatus.confirmed, OrderStatus.canceled]).optional().default(OrderStatus.pending),
})

export type OrderSchemaType = z.infer<typeof OrderSchema>
export type CreateOrderType = z.infer<typeof CreateOrderSchema>
export type UpdateOrderType = z.infer<typeof UpdateOrderSchema>


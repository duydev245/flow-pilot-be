import z from "zod";
import { OrderStatus } from "../constants/order.constant";

export const OrderSchema = z.object({
    id: z.uuid(),
    workspace_id: z.uuid().optional().nullable(),
    package_id: z.uuid(),
    total_amount: z.number(),
    created_at: z.date().default(new Date()),
    updated_at: z.date().optional(),
    status: z.enum([OrderStatus.pending, OrderStatus.paid, OrderStatus.canceled]).default(OrderStatus.pending),
})

export type OrderSchemaType = z.infer<typeof OrderSchema>

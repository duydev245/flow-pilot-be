export const OrderStatus = {
    pending: 'pending',
    paid: 'paid',
    canceled: 'canceled'
} as const

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus]
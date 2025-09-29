export const OrderStatus = {
    pending: 'pending',
    confirmed: 'confirmed',
    canceled: 'canceled'
} as const

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus]
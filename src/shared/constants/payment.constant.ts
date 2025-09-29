export const PaymentStatus = {
    pending: 'pending',
    success: 'success',
    failed: 'failed',
    refunded: 'refunded',
} as const

export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus]


export const PaymentMethod = {
    credit_card: 'credit_card',
    bank_transfer: 'bank_transfer',
    momo: 'momo',
    zalo_pay: 'zalo_pay',
} as const

export type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod]
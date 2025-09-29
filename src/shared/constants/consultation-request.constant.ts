export const ConsultationStatus = {
    new: 'new',
    contacted: 'contacted',
    closed: 'closed',
} as const

export type ConsultationStatusType = (typeof ConsultationStatus)[keyof typeof ConsultationStatus]
import z from "zod"

export const MessageResSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.any().optional()
})

export type MessageResType = z.infer<typeof MessageResSchema>

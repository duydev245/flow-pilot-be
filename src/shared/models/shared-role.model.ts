import z from "zod";

export const SystemRoleSchema = z.object({
    id: z.number().int().positive(),
    role: z.string().min(1),
    created_at: z.date(),
    updated_at: z.date().nullable(),
});

export type RoleType = z.infer<typeof SystemRoleSchema>

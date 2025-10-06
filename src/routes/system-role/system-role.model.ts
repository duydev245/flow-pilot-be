import z from 'zod'

export const CreateSystemRoleBodySchema = z.object({
  role: z.string().min(1, 'Role name is required').max(255, 'Role name is too long'),
}).strict()

export const CreateSystemRoleSchema = z.object({
  role: z.string().min(1, 'Role name is required').max(255, 'Role name is too long'),
}).strict()

export const UpdateSystemRoleSchema = z.object({
  role: z.string().min(1, 'Role name is required').max(255, 'Role name is too long').optional(),
}).strict()

export type CreateSystemRoleBodyType = z.infer<typeof CreateSystemRoleBodySchema>
export type CreateSystemRoleType = z.infer<typeof CreateSystemRoleSchema>
export type UpdateSystemRoleType = z.infer<typeof UpdateSystemRoleSchema>
import { UserStatus } from 'src/shared/constants/auth.constant'
import z from 'zod'

export const UserCreateSchema = z
  .object({
    name: z.string().max(255),
    email: z.email().max(500),
    password: z.string().min(6).max(255),
    role_id: z.number().int(),
    status: z.enum([UserStatus.active, UserStatus.inactive]).optional().default(UserStatus.active),
  })
  .strict()
export const UserUpdateSchema = z.object({
  name: z.string().max(255).optional(),
  email: z.email().max(500).optional(),
  // password: z.string().min(6).max(255).optional(),
  role_id: z.number().int().optional(),
  status: z.enum([UserStatus.active, UserStatus.inactive]).optional(),
  avatar_url: z.url().optional(),
  workspace_id: z.uuid().optional(),
  department_id: z.number().int().optional(),
  // is_first_login: z.boolean().optional(),
  // password_changed_at: z.iso.datetime({ offset: true }).optional(),
  // created_at: z.iso.datetime({ offset: true }).optional(),
  // updated_at: z.iso.datetime({ offset: true }).optional(),
})
export const UserDeletechema = z.object({
  status: z.enum([UserStatus.active, UserStatus.inactive]).optional(),
})

export type UserCreateType = z.infer<typeof UserCreateSchema>
export type UserUpdateType = z.infer<typeof UserUpdateSchema>
export type UserDeleteType = z.infer<typeof UserDeletechema>

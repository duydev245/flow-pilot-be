import { UserStatus } from 'src/shared/constants/auth.constant'
import { UserSchema } from 'src/shared/models/shared-user.model'
import z from 'zod'

export const UserCreateSchema = UserSchema.pick({
  name: true,
  email: true,
  role_id: true,
  workspace_id: true,
}).strict()

export const UserCreateByAdminSchema = UserSchema.pick({
  name: true,
  email: true,
  role_id: true,
}).strict()

export const UserUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
  avatar_url: z.string().optional().nullable(),
  department_id: z.number().optional().nullable(),
  role_id: z.number().optional(),
  workspace_id: z.uuid().optional(),
})

export const UserUpdateByAdminSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
  avatar_url: z.string().optional().nullable(),
  department_id: z.number().optional().nullable(),
  role_id: z.number().optional(),
})

export const UserUpdateProfileSchema = z.object({
  name: z.string().optional(),
  avatar_url: z.string().optional().nullable(),
  phone: z.string().min(10).max(15).nullable().optional(),
  address: z.string().min(1).max(500).nullable().optional(),
  bio: z.string().min(1).max(500).nullable().optional(),
  nickname: z.string().min(1).max(100).nullable().optional(),
})

export const ActiveUserSchema = z.object({
  status: z.enum([UserStatus.active]),
}).strict()

export type UserCreateType = z.infer<typeof UserCreateSchema>
export type UserCreateByAdminType = z.infer<typeof UserCreateByAdminSchema>
export type UserUpdateType = z.infer<typeof UserUpdateSchema>
export type UserUpdateByAdminType = z.infer<typeof UserUpdateByAdminSchema>
export type UserUpdateProfileType = z.infer<typeof UserUpdateProfileSchema>
export type ActiveUserType = z.infer<typeof ActiveUserSchema>

import { UserSchema } from 'src/shared/models/shared-user.model'
import z from 'zod'

export const UserCreateSchema = UserSchema.pick({
  name: true,
  email: true,
  role_id: true,
  workspace_id: true,
}).strict()

export const UserUpdateSchema = UserSchema.omit({ email: true }).partial().strict()

export const UserDeleteSchema = UserSchema.pick({
  status: true,
})

export type UserCreateType = z.infer<typeof UserCreateSchema>
export type UserUpdateType = z.infer<typeof UserUpdateSchema>
export type UserDeleteType = z.infer<typeof UserDeleteSchema>

import { UserStatus } from 'src/shared/constants/auth.constant'
import { UserSchema } from 'src/shared/models/shared-user.model'
import z from 'zod'



export const UserCreateSchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
  role_id: true,
  status: true,
}).strict()

export const UserUpdateSchema = UserSchema.omit({ email: true }).partial().strict()

export const UserDeletechema = UserSchema.pick({
  status: true,
})

export type UserCreateType = z.infer<typeof UserCreateSchema>
export type UserUpdateType = z.infer<typeof UserUpdateSchema>
export type UserDeleteType = z.infer<typeof UserDeletechema>

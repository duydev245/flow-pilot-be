import { createZodDto } from 'nestjs-zod'
import { ActiveUserSchema, UserCreateByAdminSchema, UserCreateSchema, UserUpdateByAdminSchema, UserUpdateProfileSchema, UserUpdateSchema } from 'src/routes/user/user.model'

export class UserCreateBodyDto extends createZodDto(UserCreateSchema) { }
export class UserCreateByAdminBodyDto extends createZodDto(UserCreateByAdminSchema) { }
export class UserUpdateBodyDto extends createZodDto(UserUpdateSchema) { }
export class UserUpdateByAdminBodyDto extends createZodDto(UserUpdateByAdminSchema) { }
export class UserUpdateProfileBodyDto extends createZodDto(UserUpdateProfileSchema) { }
export class ActiveUserBodyDTO extends createZodDto(ActiveUserSchema) { }

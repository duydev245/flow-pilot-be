import { createZodDto } from 'nestjs-zod'
import { UserCreateByAdminSchema, UserCreateSchema, UserDeleteSchema, UserUpdateByAdminSchema, UserUpdateSchema } from 'src/routes/user/user.model'

export class UserCreateBodyDto extends createZodDto(UserCreateSchema) { }
export class UserCreateByAdminBodyDto extends createZodDto(UserCreateByAdminSchema) { }
export class UserUpdateBodyDto extends createZodDto(UserUpdateSchema) { }
export class UserUpdateByAdminBodyDto extends createZodDto(UserUpdateByAdminSchema) { }
export class UserDeleteBodyDto extends createZodDto(UserDeleteSchema) { }

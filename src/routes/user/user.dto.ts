import { createZodDto } from 'nestjs-zod'
import { UserCreateSchema, UserDeleteSchema, UserUpdateSchema } from 'src/routes/user/user.model'

export class UserCreateBodyDto extends createZodDto(UserCreateSchema) {}
export class UserUpdateBodyDto extends createZodDto(UserUpdateSchema) {}
export class UserDeleteBodyDto extends createZodDto(UserDeleteSchema) {}

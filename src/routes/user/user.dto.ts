import { createZodDto } from 'nestjs-zod'
import { UserCreateSchema, UserDeletechema, UserUpdateSchema } from 'src/routes/user/user.model'

export class UserBodyDto extends createZodDto(UserCreateSchema) {}
export class UserUpdateDto extends createZodDto(UserUpdateSchema) {}
export class UserDeleteDto extends createZodDto(UserDeletechema) {}

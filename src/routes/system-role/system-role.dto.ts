import { createZodDto } from 'nestjs-zod'
import { CreateSystemRoleBodySchema, UpdateSystemRoleSchema } from './system-role.model'

export class CreateSystemRoleBodyDto extends createZodDto(CreateSystemRoleBodySchema) { }
export class UpdateSystemRoleBodyDto extends createZodDto(UpdateSystemRoleSchema) { }
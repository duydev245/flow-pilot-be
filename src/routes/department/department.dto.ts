import { createZodDto } from 'nestjs-zod'
import { CreateDepartmentBodySchema, UpdateDepartmentSchema } from './department.model'

export class CreateDepartmentBodyDto extends createZodDto(CreateDepartmentBodySchema) { }
export class UpdateDepartmentBodyDto extends createZodDto(UpdateDepartmentSchema) { }

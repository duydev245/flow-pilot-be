import { createZodDto } from 'nestjs-zod'
import { PackageCreateSchema, PackageDeleteSchema, PackageUpdateSchema } from 'src/routes/package/package.model'

export class PackageBodyDto extends createZodDto(PackageCreateSchema) {}
export class PackageUpdateDto extends createZodDto(PackageUpdateSchema) {}
export class PackageDeleteDto extends createZodDto(PackageDeleteSchema) {}

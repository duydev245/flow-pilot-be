import { createZodDto } from 'nestjs-zod'
import { FeatureCreateSchema, FeatureDeleteSchema, FeatureUpdateSchema } from 'src/routes/feature/feature.model'

export class FeatureBodyDto extends createZodDto(FeatureCreateSchema) {}
export class FeatureBodyDeleteDto extends createZodDto(FeatureDeleteSchema) {}
export class FeatureUpdateBodyDto extends createZodDto(FeatureUpdateSchema){}
import { createZodDto } from 'nestjs-zod'
import { CreateProjectSchema, ProjectIdSchema, UpdateProjectSchema } from 'src/shared/models/shared-project-model'

export class ProjectBodyDto extends createZodDto(CreateProjectSchema) {}
export class ProjectUpdateDto extends createZodDto(UpdateProjectSchema) {}
export class ProjectIdDto extends createZodDto(ProjectIdSchema) {}

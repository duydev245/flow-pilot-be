import { createZodDto } from 'nestjs-zod'
import { CreateProjectSchema, CreateProjectSchemaByAdmin, ProjectIdSchema, UpdateProjectByAdminSchema, UpdateProjectByUserSchema } from 'src/routes/project/project.model'
import { } from 'src/shared/models/shared-project-model'

export class ProjectAdminBodyDto extends createZodDto(CreateProjectSchemaByAdmin) {}
export class ProjecAdmintUpdateDto extends createZodDto(UpdateProjectByAdminSchema) {}
export class ProjectUpdateDto extends createZodDto(UpdateProjectByUserSchema) {}
export class ProjectIdDto extends createZodDto(ProjectIdSchema) {}
export class ProjectBodyDto extends createZodDto(CreateProjectSchema) {}

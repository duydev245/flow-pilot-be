import { createZodDto } from 'nestjs-zod';
import { WorkspaceCreateSchema, WorkspaceUpdateSchema, WorkspaceDeleteSchema } from './workspace.model';

export class WorkspaceBodyDto extends createZodDto(WorkspaceCreateSchema) {}
export class WorkspaceUpdateDto extends createZodDto(WorkspaceUpdateSchema) {}
export class WorkspaceDeleteDto extends createZodDto(WorkspaceDeleteSchema) {}

import { createZodDto } from 'nestjs-zod';
import { WorkspaceDeleteSchema, ExtendWorkspaceSchema, WorkspaceBodySchema, WorkspaceUpdateBodySchema } from './workspace.model';

export class WorkspaceBodyDto extends createZodDto(WorkspaceBodySchema) {}
export class WorkspaceUpdateDto extends createZodDto(WorkspaceUpdateBodySchema) {}
export class WorkspaceDeleteDto extends createZodDto(WorkspaceDeleteSchema) {}

export class ExtendWorkspaceDto extends createZodDto(ExtendWorkspaceSchema) {}

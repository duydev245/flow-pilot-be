import { z } from 'zod';
import { WorkspaceStatus } from '../constants/workspace.constant';

export const WorkspaceSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    company_code: z.string().optional().nullable(),
    company_name: z.string(),
    package_id: z.uuid(),
    start_date: z.date(),
    expire_date: z.date(),
    created_at: z.date().default(() => new Date()),
    updated_at: z.date().nullable().default(() => new Date()),
    status: z.enum([WorkspaceStatus.active, WorkspaceStatus.inactive]).default(WorkspaceStatus.active),
});

export type WorkspaceType = z.infer<typeof WorkspaceSchema>;
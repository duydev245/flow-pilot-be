import z from 'zod'
import { WorkspaceStatus } from 'src/shared/constants/common.constant'

export const WorkspaceSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2).max(100),
  company_code: z.string().max(50).nullable().optional(),
  company_name: z.string().min(2).max(100),
  package_id: z.uuid(),
  start_date: z.date(),
  expire_date: z.date(),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().optional(),
  status: z.enum([WorkspaceStatus.active, WorkspaceStatus.inactive]).default(WorkspaceStatus.active),
})

export const WorkspaceBodySchema = z.object({
  name: z.string().min(2).max(100),
  company_code: z.string().max(50).nullable().optional(),
  company_name: z.string().min(2).max(100),
  package_id: z.uuid(),
  start_date: z.string().transform((str) => new Date(str)),
  expire_date: z.string().transform((str) => new Date(str)),
  status: z.enum([WorkspaceStatus.active, WorkspaceStatus.inactive]).default(WorkspaceStatus.active),
})

export const WorkspaceCreateSchema = WorkspaceSchema.pick({
  name: true,
  company_code: true,
  company_name: true,
  package_id: true,
  start_date: true,
  expire_date: true,
  status: true,
})

export const WorkspaceUpdateBodySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  company_code: z.string().max(50).nullable().optional(),
  company_name: z.string().min(2).max(100).optional(),
  package_id: z.uuid().optional(),
  start_date: z.string().transform((str) => new Date(str)).optional(),
  expire_date: z.string().transform((str) => new Date(str)).optional(),
  status: z.enum([WorkspaceStatus.active, WorkspaceStatus.inactive]).optional(),
})

export const WorkspaceUpdateSchema = WorkspaceSchema.pick({
  name: true,
  company_code: true,
  company_name: true,
  package_id: true,
  start_date: true,
  expire_date: true,
  status: true,
}).partial()

export const ExtendWorkspaceSchema = z.object({
  package_id: z.uuid(),
  start_date: z.string().optional(),
})

export const WorkspaceDeleteSchema = z.object({
  status: z.enum([WorkspaceStatus.active, WorkspaceStatus.inactive]),
})

export type ExtendWorkspaceType = z.infer<typeof ExtendWorkspaceSchema>
export type WorkspaceCreateType = z.infer<typeof WorkspaceCreateSchema>
export type WorkspaceUpdateType = z.infer<typeof WorkspaceUpdateSchema>
export type WorkspaceDeleteType = z.infer<typeof WorkspaceDeleteSchema>

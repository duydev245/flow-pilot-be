import z from 'zod'
import { PackageStatus } from 'src/shared/constants/common.constant'

export const WorkspaceSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2).max(100),
  company_code: z.string().max(50).nullable().optional(),
  company_name: z.string().min(2).max(100),
  package_id: z.uuid(),
  start_date: z.string(),
  expire_date: z.string().nullable().optional(),
  created_at: z.string().default(() => new Date().toISOString()),
  updated_at: z.string().optional(),
  status: z.enum([PackageStatus.active, PackageStatus.inactive]).default(PackageStatus.active),
})

export const WorkspaceCreateSchema = WorkspaceSchema.pick({
  name: true,
  company_code: true,
  company_name: true,
  package_id: true,
  start_date: true,
  status: true,
})

export const WorkspaceUpdateSchema = WorkspaceCreateSchema.pick({
  name: true,
  company_code: true,
  company_name: true,
  status: true,
})
export const ExtendWorkspaceSchema = z.object({
  package_id: z.uuid(),
  start_date: z.string().optional(),
})

export const WorkspaceDeleteSchema = z.object({
  status: z.enum([PackageStatus.active, PackageStatus.inactive]),
})

export type ExtendWorkspaceType = z.infer<typeof ExtendWorkspaceSchema>
export type WorkspaceCreateType = z.infer<typeof WorkspaceCreateSchema>
export type WorkspaceUpdateType = z.infer<typeof WorkspaceUpdateSchema>
export type WorkspaceDeleteType = z.infer<typeof WorkspaceDeleteSchema>

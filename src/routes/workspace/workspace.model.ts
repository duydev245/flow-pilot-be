import z from 'zod'
import { PackageStatus } from 'src/shared/constants/common.constant'

export const WorkspaceSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2).max(100),
  company_code: z.string().max(50).nullable().optional(),
  company_name: z.string().min(2).max(100),
  package_id: z.uuid(),
  start_date: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
    return arg
  }, z.date()),
  expire_date: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
    return arg
  }, z.date()),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().nullable(),
  status: z.enum([PackageStatus.active, PackageStatus.inactive]).default(PackageStatus.active),
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

export const WorkspaceUpdateSchema = WorkspaceCreateSchema.pick({
  name: true,
  company_code: true,
  company_name: true,
  status: true,
})
export const ExtendWorkspaceSchema = z.object({
  start_date: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
    return arg
  }, z.date()),
  package_id: z.uuid(),
  expire_date: z
    .preprocess((arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
      return arg
    }, z.date())
    .optional(),
})

export const WorkspaceDeleteSchema = WorkspaceSchema.pick({ status: true })

export type ExtendWorkspaceType = z.infer<typeof ExtendWorkspaceSchema>
export type WorkspaceCreateType = z.infer<typeof WorkspaceCreateSchema>
export type WorkspaceUpdateType = z.infer<typeof WorkspaceUpdateSchema>
export type WorkspaceDeleteType = z.infer<typeof WorkspaceDeleteSchema>

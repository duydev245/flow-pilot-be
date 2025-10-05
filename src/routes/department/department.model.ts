import { DepartmentStatus } from 'src/shared/constants/common.constant'
import z from 'zod'

export const CreateDepartmentBodySchema = z.object({
  name: z.string().min(1, 'Department name is required').max(255, 'Department name is too long'),
  description: z.string().optional().nullable(),
}).strict()

export const CreateDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(255, 'Department name is too long'),
  description: z.string().optional().nullable(),
  workspace_id: z.uuid('Invalid workspace ID'),
}).strict()

export const UpdateDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(255, 'Department name is too long').optional(),
  description: z.string().optional().nullable(),
  status: z.enum([DepartmentStatus.active, DepartmentStatus.inactive]).optional(),
}).strict()

export type CreateDepartmentBodyType = z.infer<typeof CreateDepartmentBodySchema>
export type CreateDepartmentType = z.infer<typeof CreateDepartmentSchema>
export type UpdateDepartmentType = z.infer<typeof UpdateDepartmentSchema>

import { PackageStatus } from 'src/shared/constants/common.constant'
import z from 'zod'

export const PackageSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2).max(100),
  duration_in_months: z.number().int().min(1).default(1),
  price: z.number().min(0),
  description: z.string().max(255).nullable().optional(),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().nullable(),
  status: z.enum([PackageStatus.active, PackageStatus.inactive]).default(PackageStatus.active),
})
export const PackageCreateSchema = PackageSchema.pick({
  name: true,
  duration_in_months: true,
  price: true,
  description: true,
  status: true,
})

export const PackageUpdateSchema = PackageCreateSchema.partial()
export const PackageDeleteSchema = PackageSchema.pick({ status: true })

export type PackageDeleteType = z.infer<typeof PackageDeleteSchema>

export type PackageCreateType = z.infer<typeof PackageCreateSchema>
export type PackageUpdateType = z.infer<typeof PackageUpdateSchema>

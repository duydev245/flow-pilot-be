import { FeatureStatus } from 'src/shared/constants/common.constant'
import z from 'zod'

export const FeatureSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2).max(100),
  description: z.string().max(255).nullable().optional(),
  created_at: z.date().default(() => new Date()),
  updated_at: z
    .date()
    .nullable()
    .default(() => new Date()),
  package_id: z.uuid(),
  status: z.enum([FeatureStatus.active, FeatureStatus.inactive]).default(FeatureStatus.active),
})

export const FeatureCreateSchema = FeatureSchema.pick({
  name: true,
  description: true,
  status: true,
  package_id: true,
})
export const FeatureUpdateSchema = FeatureSchema.pick({
  name: true,
  description: true,
  status: true,
  package_id: true,
})
export const FeatureDeleteSchema = FeatureSchema.pick({
  status: true,
})
export type FeatureDeleteType = z.infer<typeof FeatureDeleteSchema>
export type FeatureUpdateType = z.infer<typeof FeatureUpdateSchema>
export type FeatureType = z.infer<typeof FeatureSchema>
export type FeatureCreateType = z.infer<typeof FeatureCreateSchema>

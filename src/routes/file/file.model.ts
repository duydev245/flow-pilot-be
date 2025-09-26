import { z } from 'zod'

export const UploadForTaskSchema = z.object({
  user_id: z.uuid(),
  task_id: z.uuid(),
})

export const UploadForUserSchema = z.object({
  user_id: z.uuid(),
})

// body schemas for endpoints when user_id comes from token
export const UploadForTaskBodySchema = z.object({
  task_id: z.uuid(),
})

export const UploadForUserBodySchema = z.object({})

export const UploadFileSchema = z.object({
  id: z.number(),
  task_id: z.uuid().nullable().optional(),
  file_name: z.string(),
  file_url: z.string(),
  file_size: z.number().nullable().optional(),
  mime_type: z.string().nullable().optional(),
  uploaded_at: z.instanceof(Date),
  uploaded_by: z.uuid(),
  created_at: z.instanceof(Date),
  updated_at: z.instanceof(Date).nullable().optional(),
})

export type UploadForTaskDto = z.infer<typeof UploadForTaskSchema>
export type UploadForUserDto = z.infer<typeof UploadForUserSchema>
export type UploadFileDto = z.infer<typeof UploadFileSchema>

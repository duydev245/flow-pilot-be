import { BinaryStatus, TaskContentStatus, TaskContentType } from 'src/shared/constants/task.constant'
import { TaskRejectionHistorySchema, TaskReviewSchema, taskSchema } from 'src/shared/models/shared-task-model'
import z from 'zod'

export const CreateTaskSchema = taskSchema.pick({
  project_id: true,
  name: true,
  description: true,
  start_at: true,
  due_date: true,
  time_spent_in_minutes: true,
  priority: true,
  status: true,
})

export const UpdateTaskSchema = taskSchema
  .pick({
    name: true,
    description: true,
    start_at: true,
    due_date: true,
    priority: true,
    status: true,
  })
  .partial()

export const TaskIdSchema = taskSchema.pick({
  id: true,
})
export const CreateTaskReviewSchema = TaskReviewSchema.pick({
  task_id: true,
  reviewer_id: true,
  task_owner_id: true,
  quality_score: true,
  notes: true,
})
export const UpdateTaskReviewSchema = TaskReviewSchema.pick({
  quality_score: true,
  notes: true,
})

export const taskContentSchema = z.object({
  id: z.uuid(),
  task_id: z.uuid(),
  user_id: z.uuid(),
  content: z.string().min(1),
  type: z.enum([TaskContentType.comment, TaskContentType.note]),
  status: z.enum([TaskContentStatus.active, TaskContentStatus.inactive]),
})
export const CreateTaskContentSchema = taskContentSchema.pick({
  task_id: true,
  user_id: true,
  content: true,
  type: true,
  status: true,
})
export const UpdateTaskContentSchema = taskContentSchema
  .pick({
    content: true,
    status: true,
  })
  .partial()

export const CreateTaskRejectionHistorySchema = TaskRejectionHistorySchema.pick({
  task_id: true,
  rejected_by: true,
  reason: true,
  notes: true,
})

export const UpdateTaskRejectionHistorySchema = TaskRejectionHistorySchema.pick({
  reason: true,
  notes: true,
}).partial()
export const TaskChecklistSchema = z.object({
  id: z.uuid(),
  task_id: z.uuid(),
  title: z.string().min(1),
  status: z.enum([BinaryStatus.active, BinaryStatus.inactive]),
  is_completed: z.boolean().optional(),
})

export const CreateTaskChecklistSchema = TaskChecklistSchema.pick({
  task_id: true,
  title: true,
  status: true,
  is_completed: true,
})

export const UpdateTaskChecklistSchema = TaskChecklistSchema.pick({
  title: true,
  status: true,
  is_completed: true,
}).partial()
export type UpdateTaskContentType = z.infer<typeof UpdateTaskContentSchema>
export type CreateTaskContentType = z.infer<typeof CreateTaskContentSchema>
export type CreateTaskChecklistType = z.infer<typeof CreateTaskChecklistSchema>
export type UpdateTaskChecklistType = z.infer<typeof UpdateTaskChecklistSchema>
export type CreateTaskReviewType = z.infer<typeof CreateTaskReviewSchema>
export type UpdateTaskReviewType = z.infer<typeof UpdateTaskReviewSchema>
export type CreateTaskType = z.infer<typeof CreateTaskSchema>
export type UpdateTaskType = z.infer<typeof UpdateTaskSchema>
export type CreateRejectHistoryType = z.infer<typeof CreateTaskRejectionHistorySchema>
export type UpdateRejectHistoryType = z.infer<typeof UpdateTaskRejectionHistorySchema>

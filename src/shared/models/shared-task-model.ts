import { TaskPriority, TaskStatus } from '@prisma/client'
import { create } from 'domain'
import z from 'zod'

export const taskSchema = z.object({
  id: z.uuid(),
  project_id: z.uuid(),
  name: z.string().min(2).max(100),
  description: z.string().max(255).optional(),
  time_spent_in_minutes: z.preprocess((val) => {
    if (typeof val === 'string') {
      return parseInt(val)
    }
    return val
  }, z.number().nonnegative().default(0)),
  image_url: z.string().optional().nullable(),
  start_at: z.string().optional(),
  due_at: z.string().optional(),
  end_at: z.string().optional(),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().nullable(),
  priority: z.enum([TaskPriority.high, TaskPriority.medium, TaskPriority.low]),
  status: z.enum([
    TaskStatus.todo,
    TaskStatus.doing,
    TaskStatus.reviewing,
    TaskStatus.rejected,
    TaskStatus.completed,
    TaskStatus.feedbacked,
    TaskStatus.overdued,
  ]),
})

export const TaskReviewSchema = z.object({
  id: z.int(),
  task_id: z.uuid(),
  reviewer_id: z.uuid(),
  task_owner_id: z.uuid(),
  quality_score: z.number().nonnegative().min(0).max(10),
  notes: z.string().min(1).optional(),
  reviewed_at: z.date().default(() => new Date()),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().nullable(),
})

export const TaskRejectionHistorySchema = z.object({
  id: z.int(),
  task_id: z.uuid(),
  rejected_by: z.uuid(),
  rejected_at: z.date().default(() => new Date()),
  reason: z.string().min(1).default(''),
  notes: z.string().min(1).default(''),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().nullable(),
})

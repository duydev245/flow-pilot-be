import { createZodDto } from 'nestjs-zod'
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskIdSchema,
  CreateTaskContentSchema,
  CreateTaskChecklistSchema,
  CreateTaskReviewSchema,
  UpdateTaskReviewSchema,
  UpdateTaskContentSchema,
  UpdateTaskChecklistSchema,
  CreateTaskRejectionHistorySchema,
  UpdateTaskRejectionHistorySchema,
} from './task.model'

export class TaskBodyDto extends createZodDto(CreateTaskSchema) {}
export class TaskUpdateDto extends createZodDto(UpdateTaskSchema) {}
export class TaskIdDto extends createZodDto(TaskIdSchema) {}

export class TaskContentBodyDto extends createZodDto(CreateTaskContentSchema) {}
export class TaskChecklistBodyDto extends createZodDto(CreateTaskChecklistSchema) {}
export class TaskContentUpdateDto extends createZodDto(UpdateTaskContentSchema) {}
export class TaskChecklistUpdateDto extends createZodDto(UpdateTaskChecklistSchema) {}
export class CreateTaskReviewDto extends createZodDto(CreateTaskReviewSchema) {}
export class UpdateTaskReviewDto extends createZodDto(UpdateTaskReviewSchema) {}
export class CreateTaskRejectBodyDto extends createZodDto(CreateTaskRejectionHistorySchema) {}
export class UpdateTaskRejectBodyDto extends createZodDto(UpdateTaskRejectionHistorySchema) {}

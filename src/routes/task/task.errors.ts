import { NotFoundException, ForbiddenException } from '@nestjs/common'

export const GetTaskFail = new NotFoundException({
  code: 'NOT_FOUND_TASK_EXCEPTION',
  message: 'Cannot get task',
})

export const  TaskNotFound = new NotFoundException({
  code: 'TASK_NOT_FOUND',
  message: 'Task not found',
})

export const UserNotAssignedToTask = new ForbiddenException({
  code: 'USER_NOT_ASSIGNED_TO_TASK',
  message: 'You are not assigned to this task',
})
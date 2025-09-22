import { NotFoundException } from '@nestjs/common'

export const GetTaskFail = new NotFoundException({
  code: 'NOT_FOUND_TASK_EXCEPTION',
  message: 'Cannot get task',
})

import { Injectable } from '@nestjs/common'
import { TaskRepository } from 'src/routes/task/task.repo'

@Injectable()
export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}
}

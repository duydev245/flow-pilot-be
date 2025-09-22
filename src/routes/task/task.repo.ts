import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { TaskStatus } from 'src/shared/constants/task.constant'
import {
  CreateTaskType,
  CreateTaskContentType,
  CreateTaskChecklistType,
  UpdateTaskType,
  UpdateTaskContentType,
  UpdateTaskChecklistType,
  CreateTaskReviewType,
  CreateRejectHistoryType,
  UpdateTaskReviewType,
} from './task.model'

@Injectable()
export class TaskRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createTaskContent(data: CreateTaskContentType) {
    return this.prismaService.taskContent.create({ data })
  }

  async createTaskChecklist(data: CreateTaskChecklistType) {
    return this.prismaService.taskChecklist.create({ data })
  }

  async markOverdueTasks() {
    const now = new Date()
    await this.prismaService.task.updateMany({
      where: {
        completed_at: null,
        due_at: { lt: now },
        status: { not: TaskStatus.overdued },
      },
      data: { status: TaskStatus.overdued },
    })
  }

  async getAllTasks() {
    await this.markOverdueTasks()
    return this.prismaService.task.findMany({
      include: {
        contents: true,
        checklists: true,
      },
    })
  }

  async getTaskById(id: string) {
    return this.prismaService.task.findUnique({
      where: { id },
      include: {
        contents: true,
        checklists: true,
      },
    })
  }

  async createTask(data: CreateTaskType) {
    const dataToCreate: any = {
      project_id: data.project_id,
      name: data.name,
      description: data.description,
      time_spent_in_minutes: data.time_spent_in_minutes,
      priority: data.priority,
      status: data.status,
    }
    if (data.start_at) dataToCreate.start_at = new Date(data.start_at)
    if (data.due_at) dataToCreate.due_at = new Date(data.due_at)
    const created = await this.prismaService.task.create({
      data: dataToCreate,
      include: {
        contents: true,
        checklists: true,
      },
    })
    return created
  }

  async updateTask(id: string, data: UpdateTaskType) {
    return this.prismaService.task.update({
      where: { id },
      data,
      include: {
        contents: true,
        checklists: true,
      },
    })
  }

  async updateTaskContent(id: number, data: UpdateTaskContentType) {
    return this.prismaService.taskContent.update({
      where: { id },
      data,
    })
  }

  async updateTaskChecklist(id: number, data: UpdateTaskChecklistType) {
    return this.prismaService.taskChecklist.update({
      where: { id },
      data,
    })
  }

  async deleteTask(id: string) {
    return this.prismaService.task.update({
      where: { id },
      data: {
        status: 'inactive' as any,
      },
    })
  }
  async deleteTaskChecklist(id: number) {
    return this.prismaService.taskChecklist.update({
      where: { id },
      data: { status: 'inactive' },
    })
  }

  async deleteTaskContent(id: number) {
    return this.prismaService.taskContent.update({
      where: { id },
      data: { status: 'inactive' },
    })
  }

  async createTaskReview(data: CreateTaskReviewType) {
    return this.prismaService.taskReview.create({ data })
  }

  async getUserProjectReviews(params: { user_id: string; project_id: string }) {
    return this.prismaService.taskReview.findMany({
      where: {
        task_owner_id: params.user_id,
        task: { project_id: params.project_id },
      },
      include: { task: true },
    })
  }

  async getUserAllReviews(user_id: string) {
    return this.prismaService.taskReview.findMany({
      where: { task_owner_id: user_id },
      include: { task: true },
    })
  }

  async upsertPerformanceData(params: {
    user_id: string
    project_id: string
    working_hours: number
    task_completed: number
    quality_score: number | null
  }) {
    await this.prismaService.performanceData.upsert({
      where: { user_id_project_id: { user_id: params.user_id, project_id: params.project_id } },
      update: {
        working_hours: { increment: params.working_hours ?? 0 },
        task_completed: { increment: params.task_completed ?? 0 },
        quality_score: params.quality_score,
      },
      create: {
        user_id: params.user_id,
        project_id: params.project_id,
        working_hours: params.working_hours ?? 0,
        task_completed: params.task_completed ?? 0,
        quality_score: params.quality_score,
      },
    })
  }

  async upsertOverallPerformance(params: {
    user_id: string
    working_hours: number
    task_completed: number
    quality_score: number | null
  }) {
    await this.prismaService.overallPerformance.upsert({
      where: { user_id: params.user_id },
      update: {
        working_hours: { increment: params.working_hours ?? 0 },
        task_completed: { increment: params.task_completed ?? 0 },
        quality_score: params.quality_score,
      },
      create: {
        user_id: params.user_id,
        working_hours: params.working_hours ?? 0,
        task_completed: params.task_completed ?? 0,
        quality_score: params.quality_score,
      },
    })
  }

  async createTaskRejectionHistory(data: CreateRejectHistoryType) {
    return this.prismaService.taskRejectionHistory.create({ data })
  }

  async updateTaskReview(id: number, data: UpdateTaskReviewType) {
    return this.prismaService.taskReview.update({
      where: { id },
      data,
    })
  }

  async getAllTaskReviews() {
    return this.prismaService.taskReview.findMany({
      include: { task: true },
    })
  }
}

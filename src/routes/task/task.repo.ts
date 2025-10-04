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
  AssingUserToTaskType,
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
        files: {
          select: {
            id: true,
            file_name: true,
            file_url: true,
            file_size: true,
            mime_type: true,
            uploaded_at: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar_url: true,
              },
            },
            task_owner: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar_url: true,
              },
            },
          },
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar_url: true,
              },
            },
          },
        },
        _count: {
          select: {
            files: true,
            reviews: true,
          },
        },
      },
    })
  }

  async getTaskById(id: string) {
    return this.prismaService.task.findUnique({
      where: { id },
      include: {
        contents: true,
        checklists: true,
        files: {
          select: {
            id: true,
            file_name: true,
            file_url: true,
            file_size: true,
            mime_type: true,
            uploaded_at: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar_url: true,
              },
            },
            task_owner: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar_url: true,
              },
            },
          },
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar_url: true,
              },
            },
          },
        },
        _count: {
          select: {
            files: true,
            reviews: true,
          },
        },
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
      image_url: data.image_url,
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
        status: TaskStatus.rejected,
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
  async getAllTaskRejects() {
    return this.prismaService.taskRejectionHistory.findMany({
      include: { task: true },
    })
  }
  async assignTaskToUser(data: AssingUserToTaskType) {
    // Lấy danh sách assignments hiện tại
    const currentAssignments = await this.prismaService.taskUser.findMany({
      where: { task_id: data.task_id },
      select: { user_id: true },
    })

    const currentUserIds = currentAssignments.map((assignment) => assignment.user_id)
    const newUserIds = data.user_ids

    // Tìm user_ids cần thêm (có trong danh sách mới nhưng chưa được assign)
    const userIdsToAdd = newUserIds.filter((userId) => !currentUserIds.includes(userId))

    // Tìm user_ids cần xóa (đang được assign nhưng không có trong danh sách mới)
    const userIdsToRemove = currentUserIds.filter((userId) => !newUserIds.includes(userId))

    // Xóa assignments không còn cần thiết
    if (userIdsToRemove.length > 0) {
      await this.prismaService.taskUser.deleteMany({
        where: {
          task_id: data.task_id,
          user_id: { in: userIdsToRemove },
        },
      })
    }

    // Thêm assignments mới
    if (userIdsToAdd.length > 0) {
      const taskUserData = userIdsToAdd.map((user_id) => ({
        task_id: data.task_id,
        user_id: user_id,
        assigned_at: new Date(),
      }))

      await this.prismaService.taskUser.createMany({
        data: taskUserData,
      })
    }

    // Trả về task với thông tin assignees và project, cùng với danh sách users mới được assign
    const task = await this.prismaService.task.findUnique({
      where: { id: data.task_id },
      include: {
        contents: true,
        checklists: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    })

    return {
      task,
      newlyAssignedUserIds: userIdsToAdd,
    }
  }

  async getMyTasks(userId: string) {
    return this.prismaService.task.findMany({
      where: {
        assignees: {
          some: {
            user_id: userId,
          },
        },
      },
      include: {
        contents: true,
        checklists: true,
        files: {
          select: {
            id: true,
            file_name: true,
            file_url: true,
            file_size: true,
            mime_type: true,
            uploaded_at: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar_url: true,
              },
            },
            task_owner: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar_url: true,
              },
            },
          },
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar_url: true,
              },
            },
          },
        },
        _count: {
          select: {
            files: true,
            reviews: true,
          },
        },
      },
    })
  }

  async isUserAssignedToTask(taskId: string, userId: string): Promise<boolean> {
    const taskUser = await this.prismaService.taskUser.findFirst({
      where: {
        task_id: taskId,
        user_id: userId,
      },
    })
    return !!taskUser
  }

  async checkTaskContentOwnership(taskContentId: number, userId: string): Promise<boolean> {
    const taskContent = await this.prismaService.taskContent.findFirst({
      where: {
        id: taskContentId,
        user_id: userId,
      },
    })
    return !!taskContent
  }

  async getTaskChecklistById(id: number) {
    return this.prismaService.taskChecklist.findUnique({
      where: { id },
    })
  }
}

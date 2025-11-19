import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { TaskStatus } from 'src/shared/constants/task.constant'
import { ProjectStatus } from '@prisma/client'
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
  constructor(private readonly prismaService: PrismaService) { }

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
        status: { in: [TaskStatus.doing] },
      },
      data: { status: TaskStatus.overdued },
    })
  }

  async getAllTasks() {
    await this.markOverdueTasks()
    return this.prismaService.task.findMany({
      include: {
        contents: {
          include: {
            user: {
              select: {
                name: true,
                avatar_url: true,
              },
            },
          },
        },
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
        contents: {
          include: {
            user: {
              select: {
                name: true,
                avatar_url: true,
              },
            },
          },
        },
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
      start_at: data.start_at ? new Date(data.start_at) : new Date(), // Nếu không có start_at thì dùng thời gian hiện tại
    }
    if (data.due_at) dataToCreate.due_at = new Date(data.due_at)
    const created = await this.prismaService.task.create({
      data: dataToCreate,
      include: {
        contents: {
          include: {
            user: {
              select: {
                name: true,
                avatar_url: true,
              },
            },
          },
        },
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
        contents: {
          include: {
            user: {
              select: {
                name: true,
                avatar_url: true,
              },
            },
          },
        },
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
    // Xóa các bản ghi liên quan trước khi xóa task
    // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
    return this.prismaService.$transaction(async (prisma) => {
      // 1. Xóa TaskContent
      await prisma.taskContent.deleteMany({
        where: { task_id: id },
      })

      // 2. Xóa TaskChecklist
      await prisma.taskChecklist.deleteMany({
        where: { task_id: id },
      })

      // 3. Xóa TaskUser (assignees)
      await prisma.taskUser.deleteMany({
        where: { task_id: id },
      })

      // 4. Xóa TaskRejectionHistory
      await prisma.taskRejectionHistory.deleteMany({
        where: { task_id: id },
      })

      // 5. Xóa TaskReview (có constraint @unique nên chỉ có 1 bản ghi)
      await prisma.taskReview.deleteMany({
        where: { task_id: id },
      })

      // 6. Cập nhật UploadFile - set task_id = null (vì task_id là nullable)
      // Hoặc có thể xóa luôn files nếu không cần giữ lại
      await prisma.uploadFile.updateMany({
        where: { task_id: id },
        data: { task_id: null },
      })

      // 7. Cuối cùng xóa Task
      return prisma.task.delete({
        where: { id },
      })
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

  async createTaskReview(data: CreateTaskReviewType & { reviewer_id: string }) {
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

  async createTaskRejectionHistory(data: CreateRejectHistoryType & { rejected_by: string }) {
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
        contents: {
          include: {
            user: {
              select: {
                name: true,
                avatar_url: true,
              },
            },
          },
        },
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
    const tasks = await this.prismaService.task.findMany({
      where: {
        assignees: {
          some: {
            user_id: userId,
          },
        },
      },
      include: {
        contents: {
          include: {
            user: {
              select: {
                name: true,
                avatar_url: true,
              },
            },
          },
        },
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

    // Define custom order for status and priority
    const statusOrder = {
      [TaskStatus.overdued]: 1,
      [TaskStatus.doing]: 2,
      [TaskStatus.todo]: 3,
      [TaskStatus.reviewing]: 4,
      [TaskStatus.feedbacked]: 5, // Assuming 'feedback' is 'feedbacked' from schema
    }

    const priorityOrder = {
      high: 3,
      medium: 2,
      low: 1,
    }

    // Sort the tasks
    tasks.sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status]
      if (statusDiff !== 0) return statusDiff

      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return tasks
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

  async getTaskContentById(id: number) {
    return this.prismaService.taskContent.findUnique({
      where: { id },
    })
  }

  async getTasksByProjectId(projectId: string) {
    return this.prismaService.task.findMany({
      where: { project_id: projectId },
      select: { id: true, status: true },
    })
  }

  async updateProjectStatus(projectId: string, status: ProjectStatus) {
    return this.prismaService.project.update({
      where: { id: projectId },
      data: { status },
    })
  }
}

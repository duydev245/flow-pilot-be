import { AssingUserToTaskType, CreateRejectHistoryType, UpdateTaskReviewType } from './task.model'
import { Injectable, Logger } from '@nestjs/common'
import { TaskRepository } from 'src/routes/task/task.repo'
import { SuccessResponse } from 'src/shared/sucess'
import {
  CreateTaskType,
  CreateTaskContentType,
  CreateTaskChecklistType,
  UpdateTaskType,
  UpdateTaskContentType,
  UpdateTaskChecklistType,
  CreateTaskReviewType,
} from './task.model'
import { GetTaskFail, TaskNotFound, UserNotAssignedToTask } from 'src/routes/task/task.errors'
import { TaskPriority, TaskStatus, ProjectStatus } from '@prisma/client'
import { InvalidFile, InvalidFileExtension, InvalidFileSize } from 'src/routes/file/file.error'
import path from 'path'
import { S3StorageService } from 'src/shared/services/s3-storage.service'
import { EmailService } from 'src/shared/services/email.service'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_EXT = ['.png', '.jpg', '.jpeg']

function getExtension(filename: string) {
  const ext = path.extname(filename || '').toLowerCase()
  return ext
}
@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name)

  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly emailService: EmailService,

    private readonly s3: S3StorageService,
  ) {}

  validateFile(file: Express.Multer.File) {
    if (!file) throw InvalidFile
    if (file.size > MAX_FILE_SIZE) throw InvalidFileSize
    const ext = getExtension(file.originalname)
    console.log('ext: ', ext)
    if (!ALLOWED_EXT.includes(ext)) throw InvalidFileExtension
  }

  async updateTask(id: string, body: UpdateTaskType, taskImage?: Express.Multer.File) {
    try {
      let taskImageUrl = ''

      if (taskImage) {
        this.validateFile(taskImage)
        const uploadTaskImage = await this.s3.uploadFile(taskImage, 'tasks-images')
        taskImageUrl = uploadTaskImage.url
      }

      // Chỉ update image_url nếu có file mới được upload
      const updateData = taskImage ? { ...body, image_url: taskImageUrl } : body
      const result = await this.taskRepository.updateTask(id, updateData)
      return SuccessResponse('Task updated successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async updateTaskContent(id: string, body: UpdateTaskContentType, userId: string) {
    try {
      // Kiểm tra xem user có quyền sửa TaskContent này không (phải là người tạo)
      const isOwner = await this.taskRepository.checkTaskContentOwnership(+id, userId)
      if (!isOwner) {
        throw UserNotAssignedToTask
      }

      // Lấy thông tin TaskContent để kiểm tra task_id
      const taskContent = await this.taskRepository.getTaskContentById(+id)
      if (!taskContent) {
        throw TaskNotFound
      }

      // Kiểm tra xem user có vẫn được assign vào task này không
      const isAssigned = await this.taskRepository.isUserAssignedToTask(taskContent.task_id, userId)
      if (!isAssigned) {
        throw UserNotAssignedToTask
      }

      const result = await this.taskRepository.updateTaskContent(+id, body)
      return SuccessResponse('TaskContent updated successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async updateTaskChecklist(id: string, body: UpdateTaskChecklistType, userId: string) {
    try {
      // Lấy thông tin TaskChecklist để kiểm tra task_id
      const taskChecklist = await this.taskRepository.getTaskChecklistById(+id)
      if (!taskChecklist) {
        throw TaskNotFound
      }

      // Kiểm tra xem user có được assign vào task này không
      const isAssigned = await this.taskRepository.isUserAssignedToTask(taskChecklist.task_id, userId)
      if (!isAssigned) {
        throw UserNotAssignedToTask
      }

      const result = await this.taskRepository.updateTaskChecklist(+id, body)
      return SuccessResponse('TaskChecklist updated successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async createTaskContent(body: CreateTaskContentType, userId: string) {
    try {
      // Kiểm tra xem user có được assign vào task này không
      const isAssigned = await this.taskRepository.isUserAssignedToTask(body.task_id, userId)
      if (!isAssigned) {
        throw UserNotAssignedToTask
      }

      const result = await this.taskRepository.createTaskContent(body)
      return SuccessResponse('TaskContent created successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async createTaskChecklist(body: CreateTaskChecklistType, userId: string) {
    try {
      // Kiểm tra xem user có được assign vào task này không
      const isAssigned = await this.taskRepository.isUserAssignedToTask(body.task_id, userId)
      if (!isAssigned) {
        throw UserNotAssignedToTask
      }

      const result = await this.taskRepository.createTaskChecklist(body)
      return SuccessResponse('TaskChecklist created successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async createTask(body: CreateTaskType, taskImage?: Express.Multer.File) {
    try {
      let due_at = body.due_at
      // tính due_at = start_at + time_spent_in_minutes
      if (body.start_at && body.time_spent_in_minutes) {
        const start = new Date(body.start_at)
        due_at = new Date(start.getTime() + body.time_spent_in_minutes * 60000).toISOString()
      }
      let taskImageUrl = ''

      if (taskImage) {
        // upload image len S3 voi folder name la tasks-images
        this.validateFile(taskImage)
        const uploadTaskImage = await this.s3.uploadFile(taskImage, 'tasks-images')
        taskImageUrl = uploadTaskImage.url
      }

      const result = await this.taskRepository.createTask({ ...body, due_at, image_url: taskImageUrl })
      return SuccessResponse('Task created successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async getTasksByProject(projectId: string, userId: string) {
    try {
      const result = await this.taskRepository.getTasksByProject(projectId, userId)
      return SuccessResponse('Tasks retrieved successfully for project', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async getTaskById(id: string) {
    try {
      const result = await this.taskRepository.getTaskById(id)
      return SuccessResponse('Task retrieved successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async deleteTask(id: string) {
    try {
      const result = await this.taskRepository.deleteTask(id)
      return SuccessResponse('Task deleted (soft) successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async deleteTaskChecklist(id: string) {
    try {
      const result = await this.taskRepository.deleteTaskChecklist(+id)
      return SuccessResponse('TaskChecklist deleted (soft) successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async deleteTaskContent(id: string) {
    try {
      const result = await this.taskRepository.deleteTaskContent(+id)
      return SuccessResponse('TaskContent deleted (soft) successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async createTaskReviewAndCaculatePerformance(body: CreateTaskReviewType, userId: string) {
    try {
      // 1. Tạo TaskReview (cho phép nhiều reviewer)
      const review = await this.taskRepository.createTaskReview({
        ...body,
        reviewer_id: userId,
      })

      // 2. Lấy thông tin task liên quan
      const task = await this.taskRepository.getTaskById(body.task_id)
      if (!task) throw GetTaskFail

      // 2.1 Nếu task chưa bị rejected, chuyển sang trạng thái feedbacked
      // (Chỉ không ghi đè nếu task đã rejected)
      if (task.status !== TaskStatus.rejected) {
        try {
          await this.taskRepository.updateTask(body.task_id, { status: TaskStatus.feedbacked })
        } catch (e) {
          // Không throw để không làm gián đoạn flow chính nếu update status thất bại
          this.logger.warn(`Failed to update task status to feedbacked for task ${body.task_id}: ${e.message}`)
        }
      }

      // 3. Lấy toàn bộ review của user này cho project (PerformanceData)
      const userProjectReviews = await this.taskRepository.getUserProjectReviews({
        user_id: userId,
        project_id: task.project_id,
      })

      // Tính quality_score trung bình có trọng số (ưu tiên)
      let totalScore = 0,
        totalWeight = 0
      for (const r of userProjectReviews) {
        // HARD CODE 1 MẸ ĐI ĐAU ĐẦU QUÁ
        let weight = 1
        if (r.task.priority === TaskPriority.high) weight = 2
        else if (r.task.priority === TaskPriority.medium) weight = 1.5
        totalScore += r.quality_score * weight
        totalWeight += weight
      }
      const avgQualityScore = totalWeight ? totalScore / totalWeight : null

      // 4. Upsert PerformanceData
      await this.taskRepository.upsertPerformanceData({
        user_id: body.task_owner_id,
        project_id: task.project_id,
        working_hours: task.time_spent_in_minutes || 0,
        task_completed: 1,
        quality_score: avgQualityScore,
      })

      // 5. Lấy toàn bộ review của user này (OverallPerformance)
      const userAllReviews = await this.taskRepository.getUserAllReviews(body.task_owner_id)
      let totalScoreAll = 0,
        totalWeightAll = 0
      for (const r of userAllReviews) {
        let weight = 1
        if (r.task.priority === TaskPriority.high) weight = 2
        else if (r.task.priority === TaskPriority.medium) weight = 1.5
        totalScoreAll += r.quality_score * weight
        totalWeightAll += weight
      }
      const avgQualityScoreAll = totalWeightAll ? totalScoreAll / totalWeightAll : null

      // 6. Upsert OverallPerformance
      await this.taskRepository.upsertOverallPerformance({
        user_id: body.task_owner_id,
        working_hours: task.time_spent_in_minutes || 0,
        task_completed: 1,
        quality_score: avgQualityScoreAll,
      })

      // 7. Kiểm tra và update project status nếu tất cả tasks đã hoàn thành
      await this.checkAndUpdateProjectStatus(task.project_id)

      return SuccessResponse('Task review created and performance updated', review)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async rejectTaskAndCaculatePerformance(body: CreateRejectHistoryType, userId: string) {
    try {
      // 1. Lưu vào TaskRejectionHistory
      const rejection = await this.taskRepository.createTaskRejectionHistory({
        ...body,
        rejected_by: userId,
      })

      // 2. Lấy thông tin task liên quan
      const task = await this.taskRepository.getTaskById(body.task_id)
      if (!task) throw GetTaskFail

      // 3. Cập nhật trạng thái task = rejected (kể cả task đã được reviewed/completed)
      await this.taskRepository.updateTask(body.task_id, { status: TaskStatus.rejected })

      // Lấy task owner để tính performance
      const taskOwner = task.assignees && task.assignees.length > 0 ? task.assignees[0].user_id : null

      let avgQualityScore: number | null = null
      if (taskOwner) {
        // 4. Lấy toàn bộ review của task owner này cho project (PerformanceData)
        const userProjectReviews = await this.taskRepository.getUserProjectReviews({
          user_id: taskOwner,
          project_id: task.project_id,
        })

        // Tính quality_score trung bình có trọng số (ưu tiên)
        let totalScore = 0,
          totalWeight = 0
        for (const r of userProjectReviews) {
          let weight = 1
          if (r.task.priority === 'high') weight = 2
          else if (r.task.priority === 'medium') weight = 1.5
          totalScore += r.quality_score * weight
          totalWeight += weight
        }
        avgQualityScore = totalWeight ? totalScore / totalWeight : null
      }

      if (taskOwner) {
        // 4. Upsert PerformanceData
        await this.taskRepository.upsertPerformanceData({
          user_id: taskOwner,
          project_id: task.project_id,
          working_hours: task.time_spent_in_minutes || 0,
          task_completed: 1,
          quality_score: avgQualityScore,
        })

        // 5. Lấy toàn bộ review của user này (OverallPerformance)
        const userAllReviews = await this.taskRepository.getUserAllReviews(taskOwner)
        let totalScoreAll = 0,
          totalWeightAll = 0
        for (const r of userAllReviews) {
          let weight = 1
          if (r.task.priority === 'high') weight = 2
          else if (r.task.priority === 'medium') weight = 1.5
          totalScoreAll += r.quality_score * weight
          totalWeightAll += weight
        }
        const avgQualityScoreAll = totalWeightAll ? totalScoreAll / totalWeightAll : null

        // 6. Upsert OverallPerformance
        await this.taskRepository.upsertOverallPerformance({
          user_id: taskOwner,
          working_hours: task.time_spent_in_minutes || 0,
          task_completed: 1,
          quality_score: avgQualityScoreAll,
        })
      }

      return SuccessResponse('Task rejected and performance updated', rejection)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async updateTaskReviewAndCaculatePerformance(id: string, body: UpdateTaskReviewType) {
    try {
      // 1. Lấy review hiện tại để lấy task_id và task_owner_id
      const currentReview = await this.taskRepository.getAllTaskReviews()
      const reviewToUpdate = Array.isArray(currentReview) ? currentReview.find((r: any) => r.id === +id) : null
      if (!reviewToUpdate) throw new Error('Review not found')
      const { task_id, task_owner_id } = reviewToUpdate

      // 2. Update TaskReview
      const review = await this.taskRepository.updateTaskReview(+id, {
        quality_score: body.quality_score,
        notes: body.notes,
      })

      // 3. Lấy thông tin task liên quan
      const task = await this.taskRepository.getTaskById(task_id)
      if (!task) throw GetTaskFail

      // 4. Lấy toàn bộ review của user này cho project (PerformanceData)
      const userProjectReviews = await this.taskRepository.getUserProjectReviews({
        user_id: task_owner_id,
        project_id: task.project_id,
      })

      // Tính quality_score trung bình có trọng số (ưu tiên)
      let totalScore = 0,
        totalWeight = 0
      for (const r of userProjectReviews) {
        let weight = 1
        if (r.task.priority === 'high') weight = 2
        else if (r.task.priority === 'medium') weight = 1.5
        totalScore += r.quality_score * weight
        totalWeight += weight
      }
      const avgQualityScore = totalWeight ? totalScore / totalWeight : null

      // 5. Upsert PerformanceData
      await this.taskRepository.upsertPerformanceData({
        user_id: task_owner_id,
        project_id: task.project_id,
        working_hours: task.time_spent_in_minutes || 0,
        task_completed: 1,
        quality_score: avgQualityScore,
      })

      // 6. Lấy toàn bộ review của user này (OverallPerformance)
      const userAllReviews = await this.taskRepository.getUserAllReviews(task_owner_id)
      let totalScoreAll = 0,
        totalWeightAll = 0
      for (const r of userAllReviews) {
        let weight = 1
        if (r.task.priority === 'high') weight = 2
        else if (r.task.priority === 'medium') weight = 1.5
        totalScoreAll += r.quality_score * weight
        totalWeightAll += weight
      }
      const avgQualityScoreAll = totalWeightAll ? totalScoreAll / totalWeightAll : null

      // 7. Upsert OverallPerformance
      await this.taskRepository.upsertOverallPerformance({
        user_id: task_owner_id,
        working_hours: task.time_spent_in_minutes || 0,
        task_completed: 1,
        quality_score: avgQualityScoreAll,
      })

      return SuccessResponse('Task review updated and performance updated', review)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async getAllTaskReviews() {
    try {
      const result = await this.taskRepository.getAllTaskReviews()
      return SuccessResponse('Task reviews retrieved successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async getAllTaskRejects() {
    try {
      const result = await this.taskRepository.getAllTaskRejects()
      return SuccessResponse('Task rejects retrieved successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async assignTaskToUser(body: AssingUserToTaskType) {
    try {
      // Kiểm tra task có tồn tại không
      const existingTask = await this.taskRepository.getTaskById(body.task_id)
      if (!existingTask) throw TaskNotFound

      // Assign users to task
      const result = await this.taskRepository.assignTaskToUser(body)

      // Gửi email cho các users mới được assign
      if (result.newlyAssignedUserIds.length > 0 && result.task) {
        const newlyAssignedUsers = result.task.assignees.filter((assignee) =>
          result.newlyAssignedUserIds.includes(assignee.user.id),
        )

        // Format due date cho email
        const dueDateString = result.task.due_at
          ? new Date(result.task.due_at).toISOString().split('T')[0] // format: yyyy-MM-dd
          : new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now if no due date

        // Gửi email cho từng user mới được assign
        for (const assignee of newlyAssignedUsers) {
          try {
            await this.emailService.sendAssignTaskEmail({
              email: assignee.user.email,
              name: assignee.user.name,
              task_name: result.task.name,
              project_name: result.task.project.name,
              due_date: dueDateString,
            })
          } catch (emailError) {
            // Continue with other emails even if one fails
          }
        }
      }

      const assignedUserCount = body.user_ids.length
      const message =
        assignedUserCount === 1
          ? 'Task assigned to user successfully'
          : `Task assigned to ${assignedUserCount} users successfully`
      return SuccessResponse(message)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }
  async getMyTasks(projectId: string, userId: string) {
    try {
      const result = await this.taskRepository.getMyTasks(projectId, userId)
      return SuccessResponse('My Tasks retrieved successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  private async checkAndUpdateProjectStatus(projectId: string) {
    try {
      // Lấy tất cả tasks của project
      const tasks = await this.taskRepository.getTasksByProjectId(projectId)

      // Kiểm tra xem tất cả tasks có status là completed hoặc feedbacked không
      const allTasksCompleted = tasks.every(
        (task) => task.status === TaskStatus.completed || task.status === TaskStatus.feedbacked,
      )

      // Nếu tất cả tasks đã hoàn thành thì update project status thành completed
      if (allTasksCompleted && tasks.length > 0) {
        await this.taskRepository.updateProjectStatus(projectId, ProjectStatus.completed)
      }
    } catch (error) {
      // Không throw error để không làm gián đoạn flow chính
    }
  }
}

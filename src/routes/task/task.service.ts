import { CreateRejectHistoryType, UpdateTaskReviewType } from './task.model'
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
import { GetTaskFail } from 'src/routes/task/task.errors'
import { TaskPriority, TaskStatus } from '@prisma/client'

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name)

  constructor(private readonly taskRepository: TaskRepository) {}

  async updateTask(id: string, body: UpdateTaskType) {
    try {
      const result = await this.taskRepository.updateTask(id, body)
      return SuccessResponse('Task updated successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async updateTaskContent(id: string, body: UpdateTaskContentType) {
    try {
      const result = await this.taskRepository.updateTaskContent(+id, body)
      return SuccessResponse('TaskContent updated successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async updateTaskChecklist(id: string, body: UpdateTaskChecklistType) {
    try {
      const result = await this.taskRepository.updateTaskChecklist(+id, body)
      return SuccessResponse('TaskChecklist updated successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async createTaskContent(body: CreateTaskContentType) {
    try {
      const result = await this.taskRepository.createTaskContent(body)
      return SuccessResponse('TaskContent created successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async createTaskChecklist(body: CreateTaskChecklistType) {
    try {
      const result = await this.taskRepository.createTaskChecklist(body)
      return SuccessResponse('TaskChecklist created successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async createTask(body: CreateTaskType) {
    try {
      let due_at = body.due_at
      // tính due_at = start_at + time_spent_in_minutes
      if (body.start_at && body.time_spent_in_minutes) {
        const start = new Date(body.start_at)
        due_at = new Date(start.getTime() + body.time_spent_in_minutes * 60000).toISOString()
      }
      const result = await this.taskRepository.createTask({ ...body, due_at })
      return SuccessResponse('Task created successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async getAllTasks() {
    try {
      const result = await this.taskRepository.getAllTasks()
      return SuccessResponse('Tasks retrieved successfully', result)
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

  async createTaskReviewAndCaculatePerformance(body: CreateTaskReviewType) {
    try {
      // 1. Tạo TaskReview (cho phép nhiều reviewer)
      const review = await this.taskRepository.createTaskReview(body)

      // 2. Lấy thông tin task liên quan
      const task = await this.taskRepository.getTaskById(body.task_id)
      if (!task) throw GetTaskFail

      // 3. Lấy toàn bộ review của user này cho project (PerformanceData)
      const userProjectReviews = await this.taskRepository.getUserProjectReviews({
        user_id: body.task_owner_id,
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

      return SuccessResponse('Task review created and performance updated', review)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async rejectTaskAndCaculatePerformance(body: CreateRejectHistoryType) {
    try {
      // 1. Lưu vào TaskRejectionHistory
      const rejection = await this.taskRepository.createTaskRejectionHistory(body)

      // 2. Lấy thông tin task liên quan
      const task = await this.taskRepository.getTaskById(body.task_id)
      if (!task) throw GetTaskFail

      // Cập nhật trạng thái task = rejected
      await this.taskRepository.updateTask(body.task_id, { status: TaskStatus.rejected })

      // 3. Lấy toàn bộ review của user này cho project (PerformanceData)
      const userProjectReviews = await this.taskRepository.getUserProjectReviews({
        user_id: body.rejected_by,
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

      // 4. Upsert PerformanceData
      await this.taskRepository.upsertPerformanceData({
        user_id: body.rejected_by,
        project_id: task.project_id,
        working_hours: task.time_spent_in_minutes || 0,
        task_completed: 1,
        quality_score: avgQualityScore,
      })

      // 5. Lấy toàn bộ review của user này (OverallPerformance)
      const userAllReviews = await this.taskRepository.getUserAllReviews(body.rejected_by)
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
        user_id: body.rejected_by,
        working_hours: task.time_spent_in_minutes || 0,
        task_completed: 1,
        quality_score: avgQualityScoreAll,
      })

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
}

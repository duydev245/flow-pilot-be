import { PrismaService } from 'src/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { PerformanceEvaluationRequestDto } from './performance.dto'

@Injectable()
export class PerformanceRepository {
  async updateProjectProcess(projectId: string, process: number) {
    return this.prismaService.project.update({
      where: { id: projectId },
      data: { process },
    })
  }
  async getRelatedDocuments(dto: { userId: string; fromDate?: string; toDate?: string }): Promise<string[]> {
    // Lấy các note từ PerformanceData
    const { userId, fromDate, toDate } = dto
    const perfNotes = await this.prismaService.performanceData.findMany({
      where: {
        user_id: userId,
        notes: { not: null },
        ...(fromDate && { created_at: { gte: new Date(fromDate) } }),
        ...(toDate && { created_at: { lte: new Date(toDate) } }),
      },
      select: { notes: true, created_at: true },
      orderBy: { created_at: 'desc' },
      take: 10,
    })

    // Lấy các comment/note từ TaskContent
    const taskContents = await this.prismaService.taskContent.findMany({
      where: {
        user_id: userId,
        content: { not: undefined },
        ...(fromDate && { created_at: { gte: new Date(fromDate) } }),
        ...(toDate && { created_at: { lte: new Date(toDate) } }),
      },
      select: { content: true, created_at: true },
      orderBy: { created_at: 'desc' },
      take: 10,
    })

    // Lấy các review về user
    const reviews = await this.prismaService.taskReview.findMany({
      where: {
        task_owner_id: userId,
        notes: { not: null },
        ...(fromDate && { created_at: { gte: new Date(fromDate) } }),
        ...(toDate && { created_at: { lte: new Date(toDate) } }),
      },
      select: { notes: true, created_at: true },
      orderBy: { created_at: 'desc' },
      take: 10,
    })

    // Lấy các reject (lý do bị từ chối/note) từ TaskRejectionHistory
    const rejections = await this.prismaService.taskRejectionHistory.findMany({
      where: {
        rejected_by: userId,
        ...(fromDate && { created_at: { gte: new Date(fromDate) } }),
        ...(toDate && { created_at: { lte: new Date(toDate) } }),
      },
      select: { reason: true, notes: true, created_at: true },
      orderBy: { created_at: 'desc' },
      take: 10,
    })

    // Gộp lại, chỉ lấy text, loại bỏ null/undefined
    return [
      ...perfNotes.map((n) => n.notes).filter((t): t is string => !!t),
      ...taskContents.map((c) => c.content).filter((t): t is string => !!t),
      ...reviews.map((r) => r.notes).filter((t): t is string => !!t),
      ...rejections.map((r) => r.reason).filter((t): t is string => !!t),
      ...rejections.map((r) => r.notes).filter((t): t is string => !!t),
    ]
  }
  constructor(private readonly prismaService: PrismaService) {}

  async getPerformanceData(userId: string, dto: PerformanceEvaluationRequestDto) {
    const { fromDate, toDate } = dto
    // Lấy performance data theo user và khoảng thời gian
    return this.prismaService.performanceData.findMany({
      where: {
        user_id: userId,
        ...(fromDate && { created_at: { gte: new Date(fromDate) } }),
        ...(toDate && { created_at: { lte: new Date(toDate) } }),
      },
      orderBy: { created_at: 'asc' },
    })
  }

  async getOverallPerformance(userId: string) {
    return this.prismaService.overallPerformance.findUnique({
      where: { user_id: userId },
    })
  }

  async getUserInfo(userId: string) {
    return this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        department: true,
      },
    })
  }

  async getProjectById(projectId: string) {
    return this.prismaService.project.findUnique({
      where: { id: projectId },
    })
  }

  async getProjectMembers(projectId: string) {
    return this.prismaService.projectUser.findMany({
      where: { project_id: projectId },
      include: {
        user: true,
      },
    })
  }


  async getUserProjectPerformanceData(userId: string, projectId: string) {
    return this.prismaService.performanceData.findMany({
      where: {
        user_id: userId,
        project_id: projectId,
      },
    })
  }

  async getTasksByProjectId(projectId: string) {
    return this.prismaService.task.findMany({
      where: { project_id: projectId },
      include: {
        assignees: true,
      },
    })
  }

  // New methods for performance metrics
  
  /**
   * Get user tasks for task completion rate calculation
   */
  async getUserTasks(userId: string, fromDate?: Date, toDate?: Date) {
    return this.prismaService.task.findMany({
      where: {
        assignees: {
          some: {
            user_id: userId,
          },
        },
        ...(fromDate && { created_at: { gte: fromDate } }),
        ...(toDate && { created_at: { lte: toDate } }),
      },
      include: {
        assignees: true,
      },
      orderBy: { created_at: 'asc' },
    })
  }

  /**
   * Get completed user tasks for throughput and time-to-completion
   */
  async getUserCompletedTasks(userId: string, fromDate?: Date, toDate?: Date) {
    return this.prismaService.task.findMany({
      where: {
        assignees: {
          some: {
            user_id: userId,
          },
        },
        status: 'completed',
        completed_at: {
          not: null,
          ...(fromDate && { gte: fromDate }),
          ...(toDate && { lte: toDate }),
        },
      },
      include: {
        assignees: true,
      },
      orderBy: { completed_at: 'asc' },
    })
  }

  /**
   * Get task rejections for error tracking
   */
  async getUserTaskRejections(userId: string, fromDate?: Date, toDate?: Date) {
    return this.prismaService.taskRejectionHistory.findMany({
      where: {
        task: {
          assignees: {
            some: {
              user_id: userId,
            },
          },
        },
        ...(fromDate && { created_at: { gte: fromDate } }),
        ...(toDate && { created_at: { lte: toDate } }),
      },
      include: {
        task: {
          include: {
            assignees: true,
          },
        },
      },
      orderBy: { created_at: 'asc' },
    })
  }

  /**
   * Get user working hours from daily focus logs (proxy for work hours)
   */
  async getUserWorkingHours(userId: string, fromDate?: Date, toDate?: Date) {
    return this.prismaService.dailyFocusLog.findMany({
      where: {
        user_id: userId,
        ...(fromDate && { created_at: { gte: fromDate } }),
        ...(toDate && { created_at: { lte: toDate } }),
      },
      orderBy: { created_at: 'asc' },
    })
  }

  /**
   * Get task reviews for quality score tracking
   */
  async getUserTaskReviews(userId: string, fromDate?: Date, toDate?: Date) {
    return this.prismaService.taskReview.findMany({
      where: {
        task_owner_id: userId,
        ...(fromDate && { created_at: { gte: fromDate } }),
        ...(toDate && { created_at: { lte: toDate } }),
      },
      include: {
        task: true,
      },
      orderBy: { created_at: 'asc' },
    })
  }

  /**
   * Get performance data for specific periods (for comparison)
   */
  async getPerformanceDataByPeriod(userId: string, fromDate: Date, toDate: Date, projectId?: string) {
    return this.prismaService.performanceData.findMany({
      where: {
        user_id: userId,
        ...(projectId && { project_id: projectId }),
        created_at: {
          gte: fromDate,
          lte: toDate,
        },
      },
      orderBy: { created_at: 'asc' },
    })
  }

  // Aggregate methods for all employees and projects

  /**
   * Get all employees
   */
  async getAllEmployees() {
    return this.prismaService.user.findMany({
      where: {
        status: 'active',
      },
      include: {
        department: true,
      },
      orderBy: { created_at: 'asc' },
    })
  }

  /**
   * Get employees in a specific project
   */
  async getProjectEmployees(projectId: string) {
    const projectUsers = await this.prismaService.projectUser.findMany({
      where: { project_id: projectId },
      include: {
        user: {
          include: {
            department: true,
          },
        },
      },
    })
    
    return projectUsers.map(pu => ({
      id: pu.user.id,
      name: pu.user.name,
      email: pu.user.email,
      status: pu.user.status,
      department: pu.user.department,
      role: pu.role,
    }))
  }

  /**
   * Get all projects
   */
  async getAllProjects() {
    return this.prismaService.project.findMany({
      orderBy: { created_at: 'asc' },
    })
  }

  /**
   * Get all active projects
   */
  async getActiveProjects() {
    return this.prismaService.project.findMany({
      where: {
        status: 'active',
      },
      orderBy: { created_at: 'asc' },
    })
  }

  /**
   * Get project tasks with assignees for aggregate calculations
   */
  async getProjectTasksWithAssignees(projectId: string, fromDate?: Date, toDate?: Date) {
    return this.prismaService.task.findMany({
      where: {
        project_id: projectId,
        ...(fromDate && { created_at: { gte: fromDate } }),
        ...(toDate && { created_at: { lte: toDate } }),
      },
      include: {
        assignees: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { created_at: 'asc' },
    })
  }

  /**
   * Get all tasks across all projects
   */
  async getAllTasks(fromDate?: Date, toDate?: Date) {
    return this.prismaService.task.findMany({
      where: {
        ...(fromDate && { created_at: { gte: fromDate } }),
        ...(toDate && { created_at: { lte: toDate } }),
      },
      include: {
        assignees: {
          include: {
            user: true,
          },
        },
        project: true,
      },
      orderBy: { created_at: 'asc' },
    })
  }

  /**
   * Get all performance data across organization
   */
  async getAllPerformanceData(fromDate?: Date, toDate?: Date, projectId?: string) {
    return this.prismaService.performanceData.findMany({
      where: {
        ...(projectId && { project_id: projectId }),
        ...(fromDate && { created_at: { gte: fromDate } }),
        ...(toDate && { created_at: { lte: toDate } }),
      },
      include: {
        user: {
          include: {
            department: true,
          },
        },
        project: true,
      },
      orderBy: { created_at: 'asc' },
    })
  }

  /**
   * Get organization-wide focus logs for working hours analysis
   */
  async getAllFocusLogs(fromDate?: Date, toDate?: Date) {
    return this.prismaService.dailyFocusLog.findMany({
      where: {
        ...(fromDate && { created_at: { gte: fromDate } }),
        ...(toDate && { created_at: { lte: toDate } }),
      },
      include: {
        user: {
          include: {
            department: true,
          },
        },
      },
      orderBy: { created_at: 'asc' },
    })
  }

  /**
   * Get all task rejections for organization-wide error tracking
   */
  async getAllTaskRejections(fromDate?: Date, toDate?: Date, projectId?: string) {
    return this.prismaService.taskRejectionHistory.findMany({
      where: {
        ...(projectId && {
          task: {
            project_id: projectId,
          },
        }),
        ...(fromDate && { created_at: { gte: fromDate } }),
        ...(toDate && { created_at: { lte: toDate } }),
      },
      include: {
        task: {
          include: {
            assignees: {
              include: {
                user: true,
              },
            },
            project: true,
          },
        },
      },
      orderBy: { created_at: 'asc' },
    })
  }

  /**
   * Get department-wise statistics
   */
  async getDepartmentStats(fromDate?: Date, toDate?: Date) {
    // Get all departments with basic info
    const departments = await this.prismaService.department.findMany({
      include: {
        users: true,
      },
    })
    
    return departments
  }

  /**
   * Get project statistics with member performance
   */
  async getProjectStatsWithMembers(projectId: string, fromDate?: Date, toDate?: Date) {
    return this.prismaService.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          where: {
            ...(fromDate && { created_at: { gte: fromDate } }),
            ...(toDate && { created_at: { lte: toDate } }),
          },
          include: {
            assignees: {
              include: {
                user: true,
              },
            },
          },
        },
        members: {
          include: {
            user: true,
          },
        },
      },
    })
  }

  /**
   * Get users with status tracking for dashboard
   */
  async getUsersWithStatusByMonth(monthStart: Date, monthEnd: Date) {
    return this.prismaService.user.findMany({
      where: {
        created_at: { lte: monthEnd }
      }
    })
  }

  /**
   * Count new hires in a period
   */
  async countNewHires(startDate: Date, endDate: Date) {
    return this.prismaService.user.count({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate
        }
      }
    })
  }

  /**
   * Find HR manager
   */
  async findHRManager() {
    return this.prismaService.user.findFirst({
      where: {
        OR: [
          { name: { contains: 'HR', mode: 'insensitive' } },
          { name: { contains: 'Human Resources', mode: 'insensitive' } },
          { department: { name: { contains: 'HR', mode: 'insensitive' } } }
        ]
      },
      include: {
        department: true
      }
    })
  }
}

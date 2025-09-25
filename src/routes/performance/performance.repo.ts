import { PrismaService } from 'src/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { PerformanceEvaluationRequestDto } from './performance.dto'

@Injectable()
export class PerformanceRepository {
  /**
   * Cập nhật process cho project
   */
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

  /**
   * Lấy thông tin dự án theo id
   */
  async getProjectById(projectId: string) {
    return this.prismaService.project.findUnique({
      where: { id: projectId },
    })
  }

  /**
   * Lấy danh sách thành viên dự án (ProjectUser join User)
   */
  async getProjectMembers(projectId: string) {
    return this.prismaService.projectUser.findMany({
      where: { project_id: projectId },
      include: {
        user: true,
      },
    })
  }

  /**
   * Lấy performance data của user trong dự án
   */
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
}

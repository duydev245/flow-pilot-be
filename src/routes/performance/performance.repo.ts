import { PrismaService } from 'src/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'

import { PerformanceEvaluationRequestDto } from './performance.dto'

@Injectable()
export class PerformanceRepository {
  /**
   * Truy xuất tài liệu liên quan (notes, comment, review) cho RAG
   */
  async getRelatedDocuments(userId: string, fromDate?: string, toDate?: string): Promise<string[]> {
    // Lấy các note từ PerformanceData
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
        task_id: undefined, // lấy reject của user, không phải của task cụ thể
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

  async getPerformanceData(dto: PerformanceEvaluationRequestDto) {
    const { userId, fromDate, toDate } = dto
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
}

import { PrismaService } from 'src/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'

import { PerformanceEvaluationRequestDto } from './performance.dto'

@Injectable()
export class PerformanceRepository {
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

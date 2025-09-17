import { Injectable } from '@nestjs/common'
import { FeatureCreateType, FeatureDeleteType, FeatureUpdateType } from 'src/routes/feature/feature.model'
import { FeatureStatus } from 'src/shared/constants/common.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class FeatureRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllFeatures({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prismaService.feature.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prismaService.feature.count(),
    ])
    return { data, total, page, limit }
  }
  async getFeatureById(featureId: string) {
    return await this.prismaService.feature.findUnique({ where: { id: featureId } })
  }
  async createFeature(body: FeatureCreateType) {
    return await this.prismaService.feature.create({
      data: {
        ...body,
        status: FeatureStatus.active,
        package_id: body.package_id,
      },
    })
  }

  async updateFeature(featureId: string, body: FeatureUpdateType) {
    return await this.prismaService.feature.update({
      where: { id: featureId },
      data: {
        ...body,
        updated_at: new Date(),
      },
    })
  }

  async deleteFeature(featureId: string, body: FeatureDeleteType) {
    return await this.prismaService.feature.update({
      where: { id: featureId },
      data: {
        status: body.status,
        updated_at: new Date(),
      },
    })
  }
}

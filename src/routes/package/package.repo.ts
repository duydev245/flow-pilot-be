import { Injectable } from '@nestjs/common'
import { PackageCreateType, PackageDeleteType, PackageUpdateType } from 'src/routes/package/package.model'
import { PackageStatus } from 'src/shared/constants/common.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class PackageRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async isExistingPackage(packageId: string) {
    return await this.prismaService.package.findUnique({
      where: { id: packageId },
    })
  }
  async getAllPackages({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prismaService.package.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        where: { status: PackageStatus.active },
        include: {
          features: {
            where: {
              status: PackageStatus.active,
            },
          },
        },
      }),
      this.prismaService.package.count({
        where: {
          status: PackageStatus.active,
        },
      }),
    ])
    return { data, total, page, limit }
  }
  async getAllPackagesBySuperAdmin({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prismaService.package.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          features: {},
        },
      }),
      this.prismaService.package.count({
        where: {
          status: PackageStatus.active,
        },
      }),
    ])
    return { data, total, page, limit }
  }
  async getPackageById(packageId: string) {
    return await this.prismaService.package.findUnique({
      where: {
        id: packageId,
      },
      include: {
        features: {
          where: {
            status: PackageStatus.active,
          },
        },
      },
    })
  }
  async createPackage(body: PackageCreateType) {
    return await this.prismaService.package.create({
      data: {
        ...body,
      },
    })
  }

  async updatePackage(packageId: string, body: PackageUpdateType) {
    return await this.prismaService.package.update({
      where: { id: packageId },
      data: {
        ...body,
        updated_at: new Date(),
      },
    })
  }

  async deletePackage(packageId: string, body: PackageDeleteType) {
    return await this.prismaService.package.update({
      where: { id: packageId },
      data: {
        ...body,
        updated_at: new Date(),
      },
    })
  }
}

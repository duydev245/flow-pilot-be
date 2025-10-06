import { Injectable } from '@nestjs/common'
import { PackageCreateType, PackageUpdateType } from 'src/routes/package/package.model'
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
    const [packages, total] = await Promise.all([
      this.prismaService.package.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        where: { status: PackageStatus.active },
        include: {
          features: {
            include: { feature: true },
          },
        },
      }),
      this.prismaService.package.count({
        where: {
          status: PackageStatus.active,
        },
      }),
    ])

    const data = packages.map((pkg) => ({
      ...pkg,
      features: pkg.features.map((pf) => pf.feature),
    }))

    return { data, total, page, limit }
  }
  async getAllPackagesBySuperAdmin({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit
    const [packages, total] = await Promise.all([
      this.prismaService.package.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          features: {
            include: { feature: true },
          },
        },
      }),
      this.prismaService.package.count({
        where: {
          status: PackageStatus.active,
        },
      }),
    ])

    // Transform data to return array of features directly
    const data = packages.map((pkg) => ({
      ...pkg,
      features: pkg.features.map((pf) => pf.feature),
    }))

    return { data, total, page, limit }
  }
  async getPackageById(packageId: string) {
    const pkg = await this.prismaService.package.findUnique({
      where: {
        id: packageId,
      },
      include: {
        features: {
          include: { feature: true },
        },
      },
    })

    if (!pkg) return null

    // Transform data to return array of features directly
    return {
      ...pkg,
      features: pkg.features.map((pf) => pf.feature),
    }
  }
  async createPackage(body: PackageCreateType) {
    const { featureIds, ...packageData } = body

    const createdPackage = await this.prismaService.package.create({
      data: packageData,
    })

    if (featureIds && featureIds.length > 0) {
      // Kiểm tra features tồn tại
      const packageFeatures = featureIds.map((featureId) => ({
        package_id: createdPackage.id,
        feature_id: featureId,
      }))
      // Sau đó tạo PackageFeature
      await this.prismaService.packageFeature.createMany({
        data: packageFeatures,
      })
    }

    const pkg = await this.prismaService.package.findUnique({
      where: { id: createdPackage.id },
      include: {
        features: {
          include: { feature: true },
        },
      },
    })

    if (!pkg) return null

    // Transform data to return array of features directly
    return {
      ...pkg,
      features: pkg.features.map((pf) => pf.feature),
    }
  }

  async updatePackage(packageId: string, body: PackageUpdateType) {
    const { featureIds, ...packageData } = body

    const updatedPackage = await this.prismaService.package.update({
      where: { id: packageId },
      data: {
        ...packageData,
        updated_at: new Date(),
      },
    })

    if (featureIds !== undefined) {
      await this.prismaService.packageFeature.deleteMany({
        where: { package_id: packageId },
      })

      if (featureIds.length > 0) {
        const packageFeatures = featureIds.map((featureId) => ({
          package_id: packageId,
          feature_id: featureId,
        }))
        await this.prismaService.packageFeature.createMany({
          data: packageFeatures,
        })
      }
    }

    const pkg = await this.prismaService.package.findUnique({
      where: { id: packageId },
      include: {
        features: {
          include: { feature: true },
        },
      },
    })

    if (!pkg) return null

    return {
      ...pkg,
      features: pkg.features.map((pf) => pf.feature),
    }
  }

  async deletePackage(packageId: string) {
    return await this.prismaService.package.update({
      where: { id: packageId },
      data: {
        status: PackageStatus.inactive,
        updated_at: new Date(),
      },
    })
  }
}

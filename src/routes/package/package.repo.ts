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
    const [data, total] = await Promise.all([
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
          features: {
            include: { feature: true },
          },
        },
      }),
      this.prismaService.package.count({}),
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
          include: { feature: true },
        },
      },
    })
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

    return await this.prismaService.package.findUnique({
      where: { id: createdPackage.id },
      include: {
        features: {
          include: { feature: true },
        },
      },
    })
  }

  async updatePackage(packageId: string, body: PackageUpdateType) {
    // Tách featureIds ra khỏi body, phần còn lại là dữ liệu package
    const { featureIds, ...packageData } = body

    // Cập nhật thông tin cơ bản của package (name, price, etc.)
    const updatedPackage = await this.prismaService.package.update({
      where: { id: packageId },
      data: {
        ...packageData,
        updated_at: new Date(),
      },
    })

    // Nếu featureIds được cung cấp, thêm mới các liên kết features (append, không ghi đè)
    if (featureIds !== undefined) {
      // Lấy danh sách feature_id đã liên kết với package này
      const existingFeatures = await this.prismaService.packageFeature.findMany({
        where: { package_id: packageId },
        select: { feature_id: true },
      })
      const existingFeatureIds = existingFeatures.map((f) => f.feature_id)

      // Lọc ra những featureIds mới mà chưa liên kết (tránh duplicate)
      const newFeatureIds = featureIds.filter((id) => !existingFeatureIds.includes(id))

      // Tạo bản ghi PackageFeature mới cho các features chưa có
      if (newFeatureIds.length > 0) {
        const packageFeatures = newFeatureIds.map((featureId) => ({
          package_id: packageId,
          feature_id: featureId,
        }))
        await this.prismaService.packageFeature.createMany({
          data: packageFeatures,
        })
      }
    }

    // Trả về package đã cập nhật kèm danh sách features liên kết
    return await this.prismaService.package.findUnique({
      where: { id: packageId },
      include: {
        features: {
          include: { feature: true },
        },
      },
    })
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

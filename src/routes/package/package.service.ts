import { Injectable, Logger } from '@nestjs/common'
import { SuccessResponse } from 'src/shared/sucess'
import { PackageCreateType, PackageDeleteType, PackageUpdateType } from 'src/routes/package/package.model'
import { PackageRepository } from 'src/routes/package/package.repo'

@Injectable()
export class PackageService {
  private readonly logger = new Logger(PackageService.name)

  constructor(private readonly packageRepository: PackageRepository) {}

  async isExistingPackage(packageId: string) {
    try {
      const result = await this.packageRepository.isExistingPackage(packageId)
      return SuccessResponse('Check package existence successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }
  async getAllPackages({ page, limit }: { page: number; limit: number }) {
    try {
      const result = await this.packageRepository.getAllPackages({ page, limit })
      return SuccessResponse('Get all packages successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }
  async getAllPackagesBySuperAdmin({ page, limit }: { page: number; limit: number }) {
    try {
      const result = await this.packageRepository.getAllPackagesBySuperAdmin({ page, limit })
      return SuccessResponse('Get all packages by super admin successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async getPackageById(id: string) {
    try {
      const result = await this.packageRepository.getPackageById(id)
      return SuccessResponse('Get package by id successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }
  async createPackage(body: PackageCreateType) {
    try {
      const result = await this.packageRepository.createPackage(body)
      return SuccessResponse('Create package successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async updatePackage(id: string, body: PackageUpdateType) {
    try {
      const result = await this.packageRepository.updatePackage(id, body)
      return SuccessResponse('Update package successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }
  async deletePackage(id: string, body: PackageDeleteType) {
    try {
      const result = await this.packageRepository.deletePackage(id, body)
      return SuccessResponse('Delete package successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }
}

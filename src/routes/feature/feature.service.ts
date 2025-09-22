import { Injectable, Logger } from '@nestjs/common'
import { PackageNotFound } from 'src/routes/feature/feature.errors'
import { FeatureCreateType, FeatureUpdateType } from 'src/routes/feature/feature.model'
import { FeatureRepository } from 'src/routes/feature/feature.repo'
import { SuccessResponse } from 'src/shared/sucess'
import { PackageRepository } from './../package/package.repo'

@Injectable()
export class FeatureService {
  private readonly logger = new Logger(FeatureService.name)

  constructor(
    private readonly featureRepository: FeatureRepository,
    private readonly packageRepository: PackageRepository,
  ) {}

  async getAllFeatures({ page, limit }: { page: number; limit: number }) {
    try {
      const result = await this.featureRepository.getAllFeatures({ page, limit })
      return SuccessResponse('Get all features successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }
  async getFeatureById(featureId: string) {
    try {
      const result = await this.featureRepository.getFeatureById(featureId)
      return SuccessResponse('Get feature by id successfully', result)
    } catch (error) {
      this.logger.error(error.message)
    }
  }

  async createFeature(body: FeatureCreateType) {
    try {
      const isPackedExist = await this.packageRepository.isExistingPackage(body.package_id)
      if (!isPackedExist) {
        return PackageNotFound
      }
      const result = await this.featureRepository.createFeature(body)
      return SuccessResponse('Create feature successfully', result)
    } catch (error) {
      this.logger.error(error.message)
    }
  }

  async updateFeature(featureId: string, body: FeatureUpdateType) {
    try {
      const isPackedExist = await this.packageRepository.isExistingPackage(body.package_id)
      if (!isPackedExist) {
        return PackageNotFound
      }
      const result = await this.featureRepository.updateFeature(featureId, body)
      return SuccessResponse('Update feature successfully', result)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  async deleteFeature(featureId: string) {
    try {
      const result = await this.featureRepository.deleteFeature(featureId)
      return SuccessResponse('Delete feature successfully', result)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
}

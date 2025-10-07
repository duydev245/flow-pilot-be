import { Injectable, Logger } from '@nestjs/common'
import { addMonths } from 'date-fns'
import { PackageRepository } from 'src/routes/package/package.repo'
import { PACKAGE_ERRORS, WORKSPACE_ERRORS } from 'src/routes/workspace/workspace.errors'
import { SuccessResponse } from 'src/shared/sucess'
import { ExtendWorkspaceType, WorkspaceCreateType, WorkspaceUpdateType } from './workspace.model'
import { WorkspaceRepository } from './workspace.repo'
import { WorkspaceStatus } from 'src/shared/constants/common.constant'

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name)

  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly packageRepository: PackageRepository,
  ) { }

  async isExistingWorkspace(workspaceId: string) {
    try {
      const result = await this.workspaceRepository.isExistingWorkspace(workspaceId)
      return SuccessResponse('Check workspace existence successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async getAllWorkspaces({ page, limit }: { page: number; limit: number }) {
    try {
      const result = await this.workspaceRepository.getAllWorkspaces({ page, limit })
      return SuccessResponse('Get all workspaces successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async getWorkspaceById(id: string) {
    try {
      const result = await this.workspaceRepository.getWorkspaceById(id)
      return SuccessResponse('Get workspace by id successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async createWorkspace(body: WorkspaceCreateType) {
    try {
      const pkg = await this.packageRepository.getPackageById(body.package_id)
      if (!pkg) throw PACKAGE_ERRORS
     
      const result = await this.workspaceRepository.createWorkspace(body)
      return SuccessResponse('Create workspace successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async updateWorkspace(id: string, body: WorkspaceUpdateType) {
    try {
      const existed = await this.workspaceRepository.isExistingWorkspace(id)
      if (!existed) throw WORKSPACE_ERRORS

      if (body.package_id) {
        const pkg = await this.packageRepository.getPackageById(body.package_id)
        if (!pkg) throw PACKAGE_ERRORS
      }

      const result = await this.workspaceRepository.updateWorkspace(id, body)
      return SuccessResponse('Update workspace successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async extendWorkspace(id: string, body: ExtendWorkspaceType) {
    try {
      // Lấy workspace hiện tại
      const currentWorkspace = await this.workspaceRepository.getWorkspaceById(id)
      if (!currentWorkspace) throw WORKSPACE_ERRORS

      // Lấy thông tin package
      const pkg = await this.packageRepository.getPackageById(body.package_id)
      if (!pkg) throw PACKAGE_ERRORS

      // Tính ngày hết hạn mới
      const currentExpireDate = currentWorkspace.expire_date ? new Date(currentWorkspace.expire_date) : new Date()
      const newExpireDate = addMonths(currentExpireDate, pkg.duration_in_months)

      const result = await this.workspaceRepository.extendWorkspace(id, {
        ...body,
        expire_date: newExpireDate.toISOString(),
      })
      return SuccessResponse('Extend workspace successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async deleteWorkspace(id: string) {
    try {
      const result = await this.workspaceRepository.deleteWorkspace(id)
      return SuccessResponse('Delete workspace successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async activateWorkspace(id: string) {
    try {
      const result = await this.workspaceRepository.updateWorkspace(id, { status: WorkspaceStatus.active })
      return SuccessResponse('Activate workspace successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }
}

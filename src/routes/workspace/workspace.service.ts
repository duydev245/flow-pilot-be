import { Injectable, Logger } from '@nestjs/common'
import { SuccessResponse } from 'src/shared/sucess'
import { WorkspaceCreateType, WorkspaceDeleteType, WorkspaceUpdateType } from './workspace.model'
import { WorkspaceRepository } from './workspace.repo'

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name)

  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

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
      const result = await this.workspaceRepository.createWorkspace(body)
      return SuccessResponse('Create workspace successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async updateWorkspace(id: string, body: WorkspaceUpdateType) {
    try {
      const result = await this.workspaceRepository.updateWorkspace(id, body)
      return SuccessResponse('Update workspace successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async deleteWorkspace(id: string, body: WorkspaceDeleteType) {
    try {
      const result = await this.workspaceRepository.deleteWorkspace(id, body)
      return SuccessResponse('Delete workspace successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }
}

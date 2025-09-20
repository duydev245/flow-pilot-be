import { Injectable, Logger } from '@nestjs/common'
import { ProjectRepository } from 'src/routes/project/project.repo'
import { CreateProjectType } from 'src/shared/models/shared-project-model'

@Injectable()
export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}
  private readonly logger = new Logger(ProjectService.name)

  async getAllProjectBySuperAdmin({ page, limit }: { page: number; limit: number }) {
    try {
      const result = await this.projectRepository.getAllProjectBySuperAdmin({ page, limit })
      return result
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }
  async getAllProject(workspaceId: string, { page, limit }: { page: number; limit: number }) {
    try {
      const result = await this.projectRepository.getAllProject(workspaceId, { page, limit })
      return result
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }
  async getProjectByIdSuperAdmin(id: string) {
    try {
      const result = await this.projectRepository.getProjectByIdSuperAdmin(id)
      return result
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }
  async getProjectById(id: string, workspaceId: string) {
    try {
      const result = await this.projectRepository.getProjectById(id, workspaceId)
      return result
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async createProjectBySuperAdmin(body: CreateProjectType) {
    try {
      return await this.projectRepository.createProjectBySuperAdmin(body)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }
}

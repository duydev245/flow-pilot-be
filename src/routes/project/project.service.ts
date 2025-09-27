import type { AssignUsersToProjectDto } from './project.model'
import { Injectable, Logger } from '@nestjs/common'
import {
  CreateProjectByAdminType,
  CreateProjectType,
  UpdateProjectByAdminType,
  UpdateProjectByUserType,
} from 'src/routes/project/project.model'
import { ProjectRepository } from 'src/routes/project/project.repo'
import {} from 'src/shared/models/shared-project-model'
import { SuccessResponse } from 'src/shared/sucess'

@Injectable()
export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}
  private readonly logger = new Logger(ProjectService.name)

  async assignUsersToProject(projectId: string, dto: AssignUsersToProjectDto) {
    try {
      const result = await this.projectRepository.assignUsersToProject(projectId, dto.users)
      return SuccessResponse('Assign users to project successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async getAllProjectBySuperAdmin({ page, limit }: { page: number; limit: number }) {
    try {
      const result = await this.projectRepository.getAllProjectBySuperAdmin({ page, limit })
      return SuccessResponse('Get all projects by super admin successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }
  async getAllProject(workspaceId: string, { page, limit }: { page: number; limit: number }) {
    try {
      const result = await this.projectRepository.getAllProject(workspaceId, { page, limit })
      return SuccessResponse('Get all projects successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }
  async getProjectByIdSuperAdmin(id: string) {
    try {
      const result = await this.projectRepository.getProjectByIdSuperAdmin(id)
      return SuccessResponse('Get project by id (super admin) successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }
  async getProjectById(id: string, workspaceId: string) {
    try {
      const result = await this.projectRepository.getProjectById(id, workspaceId)
      return SuccessResponse('Get project by id successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async createProjectBySuperAdmin(body: CreateProjectByAdminType) {
    try {
      const result = await this.projectRepository.createProjectBySuperAdmin(body)
      return SuccessResponse('Create project by super admin successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async updateProjectBySuperAdmin(id: string, body: UpdateProjectByAdminType) {
    try {
      const result = await this.projectRepository.updateProjectBySuperAdmin(id, body)
      return SuccessResponse('Update project by super admin successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async deleteProjectBySuperAdmin(id: string) {
    try {
      await this.projectRepository.getProjectByIdSuperAdmin(id)
      const result = await this.projectRepository.deleteProjectBySuperAdmin(id)
      return SuccessResponse('Delete project by super admin successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async createProjectByUser(body: CreateProjectType, workspaceId: string) {
    try {
      const result = await this.projectRepository.createProjectByUser(body, workspaceId)
      return SuccessResponse('Create project by user successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async updateProjectByUser(id: string, body: UpdateProjectByUserType, workspaceId: string) {
    try {
      const result = await this.projectRepository.updateProjectByUser(id, body, workspaceId)
      return SuccessResponse('Update project by user successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }

  async deleteProjectByUser(id: string, workspaceId: string) {
    try {
      await this.projectRepository.getProjectById(id, workspaceId)
      const result = await this.projectRepository.deleteProjectBySuperAdmin(id)
      return SuccessResponse('Delete project by user successfully', result)
    } catch (error) {
      this.logger.error(error.message)
      throw error
    }
  }
}

import { Injectable } from '@nestjs/common'
import { CreateProjectType } from 'src/shared/models/shared-project-model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class ProjectRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllProjectBySuperAdmin({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prismaService.project.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prismaService.project.count(),
    ])
    return { data, total, page, limit }
  }

  async getAllProject(workspaceId: string, { page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prismaService.project.findMany({
        where: { workspace_id: workspaceId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prismaService.project.count({ where: { workspace_id: workspaceId } }),
    ])
    return { data, total, page, limit }
  }

  async createProjectBySuperAdmin(body: CreateProjectType) {
    const data = { ...body }
    console.log('data: ', data);
    if (data.start_date) data.start_date = new Date(data.start_date).toISOString()
    if (data.end_date) data.end_date = new Date(data.end_date).toISOString()
    return this.prismaService.project.create({ data })
  }

  async getProjectByIdSuperAdmin(id: string) {
    return this.prismaService.project.findUnique({ where: { id } })
  }

  async getProjectById(id: string, workspaceId: string) {
    return this.prismaService.project.findUnique({ where: { id, workspace_id: workspaceId } })
  }
}

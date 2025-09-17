import { Injectable } from '@nestjs/common'
import { WorkspaceCreateType, WorkspaceDeleteType, WorkspaceUpdateType } from './workspace.model'
import { WorkspaceStatus } from 'src/shared/constants/common.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class WorkspaceRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async isExistingWorkspace(workspaceId: string) {
    return await this.prismaService.workspace.findUnique({
      where: { id: workspaceId },
    })
  }

  async getAllWorkspaces({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prismaService.workspace.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          package: true,
        },
      }),
      this.prismaService.workspace.count({
        where: { status: WorkspaceStatus.active },
      }),
    ])
    return { data, total, page, limit }
  }

  async getWorkspaceById(workspaceId: string) {
    return await this.prismaService.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        package: true,
      },
    })
  }

  async createWorkspace(body: WorkspaceCreateType) {
    return await this.prismaService.workspace.create({
      data: { ...body },
    })
  }

  async updateWorkspace(workspaceId: string, body: WorkspaceUpdateType) {
    return await this.prismaService.workspace.update({
      where: { id: workspaceId },
      data: { ...body, updated_at: new Date() },
    })
  }

  async deleteWorkspace(workspaceId: string, body: WorkspaceDeleteType) {
    return await this.prismaService.workspace.update({
      where: { id: workspaceId },
      data: { ...body, updated_at: new Date() },
    })
  }
}

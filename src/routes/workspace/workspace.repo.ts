import { Injectable } from '@nestjs/common'
import { WorkspaceStatus } from 'src/shared/constants/common.constant'
import { PrismaService } from 'src/shared/services/prisma.service'
import { ExtendWorkspaceType, WorkspaceCreateType, WorkspaceUpdateType } from './workspace.model'

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

  async createWorkspace(data: WorkspaceCreateType & { expire_date: string }) {
    return this.prismaService.workspace.create({
      data: {
        ...data,
        start_date: new Date(data.start_date),
        expire_date: new Date(data.expire_date),
      },
    })
  }

  async updateWorkspace(workspaceId: string, body: WorkspaceUpdateType) {
    return await this.prismaService.workspace.update({
      where: { id: workspaceId },
      data: { ...body, updated_at: new Date() },
    })
  }
  async extendWorkspace(workspaceId: string, body: ExtendWorkspaceType & { expire_date: string }) {
    return await this.prismaService.workspace.update({
      where: { id: workspaceId },
      data: {
        ...body,
        start_date: body.start_date ? new Date(body.start_date) : undefined,
        expire_date: new Date(body.expire_date),
        updated_at: new Date(),
      },
    })
  }

  async deleteWorkspace(workspaceId: string) {
    return await this.prismaService.workspace.update({
      where: { id: workspaceId },
      data: {
        status: WorkspaceStatus.inactive,
        updated_at: new Date(),
      },
    })
  }
}

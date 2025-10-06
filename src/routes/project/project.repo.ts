import { Injectable } from '@nestjs/common'
import { ProjectStatus } from '@prisma/client'
import {
  CreateProjectByAdminType,
  CreateProjectType,
  UpdateProjectByAdminType,
  UpdateProjectByUserType,
  PaginationParams,
} from 'src/routes/project/project.model'
import {} from 'src/shared/models/shared-project-model'
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
        include: {
          manager: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
        },
      }),
      this.prismaService.project.count({ where: { workspace_id: workspaceId } }),
    ])
    return { data, total, page, limit }
  }

  async createProjectBySuperAdmin(body: CreateProjectByAdminType) {
    const data = { ...body }
    if (data.start_date) data.start_date = new Date(data.start_date).toISOString()
    if (data.end_date) data.end_date = new Date(data.end_date).toISOString()
    return this.prismaService.project.create({ data })
  }

  async getProjectByIdSuperAdmin(id: string) {
    return this.prismaService.project.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar_url: true,
                role: {
                  select: { role: true },
                },
                department: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    })
  }

  async getProjectById(id: string, workspaceId: string) {
    return this.prismaService.project.findFirst({
      where: { id, workspace_id: workspaceId },
      include: {
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar_url: true,
                role: {
                  select: { role: true },
                },
                department: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    })
  }

  async updateProjectBySuperAdmin(id: string, body: UpdateProjectByAdminType) {
    const data = { ...body }
    if (data.start_date) data.start_date = new Date(data.start_date).toISOString()
    if (data.end_date) data.end_date = new Date(data.end_date).toISOString()
    return this.prismaService.project.update({ where: { id }, data })
  }

  async deleteProjectBySuperAdmin(id: string) {
    return this.prismaService.project.update({
      where: { id },
      data: {
        status: ProjectStatus.inactive,
      },
    })
  }
  async createProjectByUser(body: CreateProjectType, workspaceId: string) {
    const data = { ...body, workspace_id: workspaceId }
    if (data.start_date) data.start_date = new Date(data.start_date).toISOString()
    if (data.end_date) data.end_date = new Date(data.end_date).toISOString()
    return this.prismaService.project.create({ data })
  }

  async updateProjectByUser(id: string, body: UpdateProjectByUserType, workspaceId: string) {
    const data = { ...body }
    if (data.start_date) data.start_date = new Date(data.start_date).toISOString()
    if (data.end_date) data.end_date = new Date(data.end_date).toISOString()
    return this.prismaService.project.update({ where: { id, workspace_id: workspaceId }, data })
  }

  async deleteProjectByUser(id: string, workspaceId: string) {
    return this.prismaService.project.update({
      where: { id, workspace_id: workspaceId },
      data: {
        status: ProjectStatus.inactive,
      },
    })
  }

  // Assign nhiều user vào project
  async assignUsersToProject(projectId: string, users: { user_id: string; role?: string }[]) {
    // Tạo các bản ghi ProjectUser
    const created = await this.prismaService.projectUser.createMany({
      data: users.map((u) => ({ project_id: projectId, user_id: u.user_id, role: u.role })),
      skipDuplicates: true,
    })
    // Cập nhật team_size
    const teamSize = await this.prismaService.projectUser.count({ where: { project_id: projectId } })
    await this.prismaService.project.update({ where: { id: projectId }, data: { team_size: teamSize } })
    return created
  }

  // Lấy danh sách user trong project
  async getProjectUsers(projectId: string, workspaceId: string, pagination: PaginationParams) {
    const { page, limit } = pagination
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      this.prismaService.projectUser.findMany({
        where: {
          project_id: projectId,
          project: {
            workspace_id: workspaceId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
              role: {
                select: {
                  role: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prismaService.projectUser.count({
        where: {
          project_id: projectId,
          project: {
            workspace_id: workspaceId,
          },
        },
      }),
    ])

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  // Remove user khỏi project
  async removeUserFromProject(projectId: string, userId: string, workspaceId: string) {
    // Kiểm tra project thuộc workspace
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId,
        workspace_id: workspaceId,
      },
    })

    if (!project) {
      throw new Error('Project not found or not accessible')
    }

    const deleted = await this.prismaService.projectUser.delete({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: userId,
        },
      },
    })

    // Cập nhật team_size
    const teamSize = await this.prismaService.projectUser.count({ where: { project_id: projectId } })
    await this.prismaService.project.update({ where: { id: projectId }, data: { team_size: teamSize } })

    return deleted
  }

  // Update role của user trong project
  async updateUserRoleInProject(projectId: string, userId: string, role: string, workspaceId: string) {
    // Kiểm tra project thuộc workspace
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId,
        workspace_id: workspaceId,
      },
    })

    if (!project) {
      throw new Error('Project not found or not accessible')
    }

    const updated = await this.prismaService.projectUser.update({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: userId,
        },
      },
      data: {
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    })

    return updated
  }

  // Lấy danh sách user có thể assign vào project
  async getAvailableUsersForProject(projectId: string, workspaceId: string, pagination: PaginationParams) {
    const { page, limit } = pagination
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where: {
          workspace_id: workspaceId,
          status: 'active',
          NOT: {
            projectUsers: {
              some: {
                project_id: projectId,
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar_url: true,
          role: {
            select: {
              role: true,
            },
          },
          department: {
            select: {
              name: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prismaService.user.count({
        where: {
          workspace_id: workspaceId,
          status: 'active',
          NOT: {
            projectUsers: {
              some: {
                project_id: projectId,
              },
            },
          },
        },
      }),
    ])

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }
}

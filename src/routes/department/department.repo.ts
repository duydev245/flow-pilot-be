import { Injectable } from '@nestjs/common'
import { BinaryStatus } from '@prisma/client'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateDepartmentType, UpdateDepartmentType } from './department.model'
import { DepartmentStatusType } from 'src/shared/constants/common.constant'

@Injectable()
export class DepartmentRepository {
    constructor(private readonly prismaService: PrismaService) { }

    async findById(id: number) {
        return this.prismaService.department.findUnique({
            where: { id },
            include: {
                workspace: {
                    select: {
                        id: true,
                        name: true,
                        company_name: true,
                    },
                },
                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        })
    }

    async findByIdWithUsers(id: number) {
        return this.prismaService.department.findUnique({
            where: { id },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar_url: true,
                    },
                },
            },
        })
    }

    async findByNameAndWorkspace(name: string, workspaceId: string) {
        return this.prismaService.department.findFirst({
            where: {
                name,
                workspace_id: workspaceId,
            },
        })
    }

    async getAllByWorkspace(workspaceId: string, page: number, limit: number) {
        const skip = (page - 1) * limit
        const where = { workspace_id: workspaceId }

        const [items, total] = await Promise.all([
            this.prismaService.department.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    status: true,
                    created_at: true,
                    updated_at: true,
                    workspace: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            users: true,
                        },
                    },
                },
                skip,
                take: Number(limit),
                orderBy: {
                    created_at: 'desc',
                },
            }),
            this.prismaService.department.count({ where }),
        ])

        return { items, total, page, limit }
    }

    async getAll(page: number, limit: number) {
        const skip = (page - 1) * limit

        const [items, total] = await Promise.all([
            this.prismaService.department.findMany({
                select: {
                    id: true,
                    name: true,
                    description: true,
                    status: true,
                    created_at: true,
                    updated_at: true,
                    workspace: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            users: true,
                        },
                    },
                },
                skip,
                take: Number(limit),
                orderBy: {
                    created_at: 'desc',
                },
            }),
            this.prismaService.department.count(),
        ])

        return { items, total, page, limit }
    }

    async create(data: CreateDepartmentType) {
        return this.prismaService.department.create({
            data: {
                name: data.name,
                description: data.description,
                workspace_id: data.workspace_id,
                status: 'active',
            },
            include: {
                workspace: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })
    }

    async update(id: number, data: UpdateDepartmentType) {
        return this.prismaService.department.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.status && { status: data.status as DepartmentStatusType }),
            },
            include: {
                workspace: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        })
    }

    async delete(id: number) {
        return this.prismaService.department.delete({
            where: { id },
        })
    }

    async getUserCount(id: number) {
        return this.prismaService.user.count({
            where: {
                department_id: id,
                status: { not: 'inactive' },
            },
        })
    }

    async checkWorkspaceExists(workspaceId: string) {
        return this.prismaService.workspace.findUnique({
            where: { id: workspaceId },
            select: { id: true },
        })
    }
}

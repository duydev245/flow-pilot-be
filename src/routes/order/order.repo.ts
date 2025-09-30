
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { UpdateOrderType } from './order.model'
import { OrderSchemaType } from 'src/shared/models/shared-order.model';

@Injectable()
export class OrderRepository {
    constructor(private readonly prismaService: PrismaService) { }

    async getAll({ page, limit }: { page: number; limit: number }) {
        const skip = (page - 1) * limit
        const [data, total] = await Promise.all([
            this.prismaService.order.findMany({
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
            }),
            this.prismaService.order.count(),
        ])
        return { data, total, page, limit }
    }

    async getById(id: string) {
        return await this.prismaService.order.findUnique({ where: { id } })
    }

    async create(body: Pick<OrderSchemaType, 'workspace_id' | 'package_id' | 'total_amount'>) {
        return await this.prismaService.order.create({ data: body })
    }

    async update(id: string, body: UpdateOrderType) {
        return await this.prismaService.order.update({ where: { id }, data: { ...body, updated_at: new Date() } })
    }

    async delete(id: string) {
        return await this.prismaService.order.update({ where: { id }, data: { status: 'canceled', updated_at: new Date() } })
    }
}


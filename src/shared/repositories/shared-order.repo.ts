import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { OrderSchemaType } from "../models/shared-order.model";


export type WhereUniqueOrderType = { id: string }

@Injectable()
export class SharedOrderRepository {
    constructor(private readonly prismaService: PrismaService) { }

    findUnique(where: WhereUniqueOrderType) {
        return this.prismaService.order.findFirst({
            where: {
                ...where,
            },
        })
    }

    findUniqueWithPackage(where: WhereUniqueOrderType) {
        return this.prismaService.order.findFirst({
            where: {
                ...where,
            },
            include: {
                package: true,
            },
        })
    }

    update(where: WhereUniqueOrderType, data: Partial<OrderSchemaType>) {
        return this.prismaService.order.update({
            where: {
                ...where,
            },
            data,
        })
    }

}
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { RoleType } from "../models/shared-role.model";

export type WhereUniqueRoleType = { id: number }

@Injectable()
export class SharedRoleRepository {
    constructor(private readonly prismaService: PrismaService) { }

    findUnique(where: WhereUniqueRoleType): Promise<RoleType | null> {
        return this.prismaService.systemRole.findFirst({
            where: {
                ...where,
            },
        })
    }

}
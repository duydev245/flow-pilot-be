import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { UserType, UserWithRoleType } from "../models/shared-user.model";

export type WhereUniqueUserType = { id: string } | { email: string }

@Injectable()
export class SharedUserRepository {
    constructor(private readonly prismaService: PrismaService) { }

    findUnique(where: WhereUniqueUserType): Promise<UserType | null> {
        return this.prismaService.user.findFirst({
            where: {
                ...where,
            },
        })
    }

    findUniqueWithRole(where: WhereUniqueUserType): Promise<UserWithRoleType | null> {
        return this.prismaService.user.findFirst({
            where: {
                ...where,
            },
            include: {
                role: true,
            },
        })
    }

    update(where: { id: string }, data: Partial<UserType>): Promise<UserType | null> {
        return this.prismaService.user.update({
            where,
            data,
        })
    }

}
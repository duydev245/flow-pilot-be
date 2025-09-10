import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { UserType } from "../models/shared-user.model";

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

    update(where: { id: string }, data: Partial<UserType>): Promise<UserType | null> {
        return this.prismaService.user.update({
            where,
            data,
        })
    }

}
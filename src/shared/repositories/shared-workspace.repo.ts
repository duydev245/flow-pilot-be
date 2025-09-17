import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { WorkspaceType } from "../models/shared-workspace.model";

export type WhereUniqueWorkspaceType = { id: string } | { name: string }

@Injectable()
export class SharedWorkspaceRepository {
    constructor(private readonly prismaService: PrismaService) { }

    findUnique(where: WhereUniqueWorkspaceType): Promise<WorkspaceType | null> {
        return this.prismaService.workspace.findFirst({
            where: {
                ...where,
            },
        })
    }

}
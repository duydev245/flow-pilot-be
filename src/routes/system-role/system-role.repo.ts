import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import { CreateSystemRoleType, UpdateSystemRoleType } from "./system-role.model";
import { SystemRole } from "@prisma/client";

export type WhereUniqueSystemRoleType = { id: number }
export type WhereSystemRoleType = {
  id?: number;
  role?: string;
}

@Injectable()
export class SystemRoleRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async create(data: CreateSystemRoleType): Promise<SystemRole> {
    return this.prismaService.systemRole.create({
      data,
    });
  }

  async findMany(options: {
    skip?: number;
    take?: number;
    where?: WhereSystemRoleType;
    orderBy?: {
      id?: 'asc' | 'desc';
      role?: 'asc' | 'desc';
      created_at?: 'asc' | 'desc';
    };
  }): Promise<SystemRole[]> {
    return this.prismaService.systemRole.findMany({
      skip: options.skip,
      take: Number(options.take),
      where: options.where,
      orderBy: options.orderBy || { id: 'asc' },
    });
  }

  async findUnique(where: WhereUniqueSystemRoleType): Promise<SystemRole | null> {
    return this.prismaService.systemRole.findUnique({
      where,
    });
  }

  async findFirst(where: WhereSystemRoleType): Promise<SystemRole | null> {
    return this.prismaService.systemRole.findFirst({
      where,
    });
  }

  async update(where: WhereUniqueSystemRoleType, data: UpdateSystemRoleType): Promise<SystemRole> {
    return this.prismaService.systemRole.update({
      where,
      data,
    });
  }

  async delete(where: WhereUniqueSystemRoleType): Promise<SystemRole> {
    return this.prismaService.systemRole.delete({
      where,
    });
  }

  async count(where?: WhereSystemRoleType): Promise<number> {
    return this.prismaService.systemRole.count({
      where,
    });
  }
}
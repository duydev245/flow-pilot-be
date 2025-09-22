import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { DailyFocusLogCreateType, DailyFocusLogUpdateType } from './focus-log.model';

@Injectable()
export class FocusLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: DailyFocusLogCreateType) {
    return this.prisma.dailyFocusLog.create({ data  });
  }

  async findAll() {
    return this.prisma.dailyFocusLog.findMany();
  }

  async findById(id: number) {
    return this.prisma.dailyFocusLog.findUnique({ where: { id } });
  }

  async update(id: number, data: DailyFocusLogUpdateType) {
    return this.prisma.dailyFocusLog.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prisma.dailyFocusLog.delete({ where: { id } });
  }
}

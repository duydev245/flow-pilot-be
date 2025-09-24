import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { NotificationCreateType, NotificationUpdateType } from '../models/shared-notification.model';

@Injectable()
export class SharedNotificationRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: NotificationCreateType) {
    return this.prisma.notification.create({ data });
  }

  async findAllWithPagination(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.notification.count(),
    ]);
    return { items, total, page, pageSize };
  }

  async findAll() {
    return this.prisma.notification.findMany();
  }

  async findAllByUserId(user_id: string) {
    return this.prisma.notification.findMany({
      where: { user_id },
    });
  }

  async findById(id: number) {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async update(id: number, data: NotificationUpdateType) {
    return this.prisma.notification.update({ where: { id }, data });
  }

  async updateByIdAndUserId(id: number, user_id: string, data: NotificationUpdateType) {
    return this.prisma.notification.update({ where: { id, user_id }, data });
  }

  async updateMany(
    where: { user_id: string, is_read: boolean },
    data: NotificationUpdateType
  ) {
    return this.prisma.notification.updateMany({ where, data });
  }

  async delete(id: number) {
    return this.prisma.notification.delete({ where: { id } });
  }

  async countUnread(user_id: string) {
    return this.prisma.notification.count({ where: { user_id, is_read: false } });
  }
}

import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  ConsultationRequestType,
  CreateConsultationRequest,
} from './consultation-request.model'

@Injectable()
export class ConsultationRequestRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async getAll({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prismaService.consultationRequest.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prismaService.consultationRequest.count(),
    ])
    return { data, total, page, limit }
  }

  async getById(id: number) {
    return await this.prismaService.consultationRequest.findUnique({ where: { id } })
  }

  async findUniqueByMail(email: string) {
    return await this.prismaService.consultationRequest.findUnique({ where: { email } });
  }

  async create(data: Pick<ConsultationRequestType, 'name' | 'email' | 'phone' | 'company_name' | 'package_id' | 'note'>) {
    return await this.prismaService.consultationRequest.create({ data })
  }

  async update(id: number, body: Partial<ConsultationRequestType>) {
    return await this.prismaService.consultationRequest.update({
      where: { id },
      data: { ...body, updated_at: new Date() },
    })
  }

  async delete(id: number) {
    // Soft delete by setting status to 'closed' (or you can remove)
    return await this.prismaService.consultationRequest.update({
      where: { id },
      data: { status: 'closed', updated_at: new Date() },
    })
  }
}

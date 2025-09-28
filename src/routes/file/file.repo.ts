import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class FileRepository {
	constructor(private readonly prismaService: PrismaService) { }

	create(data: {
		task_id?: string | null
		file_name: string
		file_url: string | null
		file_key: string
		file_size?: number | null
		mime_type?: string | null
		uploaded_by: string
	}) {
		const createData: any = {
			file_name: data.file_name,
			file_url: data.file_url,
			file_key: data.file_key,
			file_size: data.file_size,
			mime_type: data.mime_type,
			uploaded_by: data.uploaded_by,
		}
		if (data.task_id) {
			createData.task_id = data.task_id
		}
		return this.prismaService.uploadFile.create({ data: createData })
	}

	findById(id: number) {
		return this.prismaService.uploadFile.findUnique({ where: { id } })
	}

	deleteById(id: number) {
		return this.prismaService.uploadFile.delete({ where: { id } })
	}

	async findByTaskId(task_id: string, page?: number, limit?: number, search?: string) {
		const skip = page && limit ? (page - 1) * limit : undefined
		const where: any = { task_id }

		if (search) {
			where.file_name = {
				contains: search,
				mode: 'insensitive'
			}
		}

		if (page && limit) {
			const [items, total] = await Promise.all([
				this.prismaService.uploadFile.findMany({
					where,
					select: {
						id: true,
						task_id: true,
						file_name: true,
						file_url: true,
						file_size: true,
						mime_type: true,
						uploaded_at: true,
						uploaded_by: true,
						created_at: true,
						updated_at: true,
					},
					orderBy: { created_at: 'desc' },
					skip,
					take: limit,
				}),
				this.prismaService.uploadFile.count({ where })
			])
			return { items, total, page, limit }
		}

		return this.prismaService.uploadFile.findMany({
			where,
			orderBy: { created_at: 'desc' },
			select: {
				id: true,
				task_id: true,
				file_name: true,
				file_url: true,
				file_size: true,
				mime_type: true,
				uploaded_at: true,
				uploaded_by: true,
				created_at: true,
				updated_at: true,
			},
		})
	}

	async findByUserId(user_id: string, page?: number, limit?: number, search?: string) {
		const skip = page && limit ? (page - 1) * limit : undefined
		const where: any = { uploaded_by: user_id, task_id: null }

		if (search) {
			where.file_name = {
				contains: search,
				mode: 'insensitive'
			}
		}

		if (page && limit) {
			const [items, total] = await Promise.all([
				this.prismaService.uploadFile.findMany({
					where,
					select: {
						id: true,
						task_id: true,
						file_name: true,
						file_url: true,
						file_size: true,
						mime_type: true,
						uploaded_at: true,
						uploaded_by: true,
						created_at: true,
						updated_at: true,
					},
					orderBy: { created_at: 'desc' },
					skip,
					take: limit,
				}),
				this.prismaService.uploadFile.count({ where })
			])
			return { items, total, page, limit }
		}

		return this.prismaService.uploadFile.findMany({
			where,
			select: {
				id: true,
				task_id: true,
				file_name: true,
				file_url: true,
				file_size: true,
				mime_type: true,
				uploaded_at: true,
				uploaded_by: true,
				created_at: true,
				updated_at: true,
			},
			orderBy: { created_at: 'desc' },
		})
	}
}

import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class FileRepository {
	constructor(private readonly prismaService: PrismaService) {}

	create(data: {
			task_id?: string | null
			file_name: string
			file_url: string
			file_size?: number | null
			mime_type?: string | null
			uploaded_by: string
		}) {
			const createData: any = {
				file_name: data.file_name,
				file_url: data.file_url,
				file_size: data.file_size,
				mime_type: data.mime_type,
				uploaded_by: data.uploaded_by,
			}
			if (data.task_id) {
				createData.task = { connect: { id: data.task_id } }
			}
			return this.prismaService.uploadFile.create({ data: createData })
	}

	findById(id: number) {
		return this.prismaService.uploadFile.findUnique({ where: { id } })
	}

	deleteById(id: number) {
		return this.prismaService.uploadFile.delete({ where: { id } })
	}
}

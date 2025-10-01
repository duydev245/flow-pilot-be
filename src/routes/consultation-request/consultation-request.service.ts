import { Injectable, Logger } from '@nestjs/common'
import { ConsultationRequestRepository } from './consultation-request.repo'
import { PackageRepository } from '../package/package.repo'
import { CreateConsultationRequest, UpdateConsultationRequest } from './consultation-request.model'
import { SuccessResponse } from 'src/shared/sucess'
import { ConsultationRequestNotFound, EmailExistsError, PackageNotFound } from './consultation-request.error'
import { EmailService } from 'src/shared/services/email.service'

@Injectable()
export class ConsultationRequestService {
	private readonly logger = new Logger(ConsultationRequestService.name)

	constructor(
		private readonly consultationRequestRepository: ConsultationRequestRepository,
		private readonly packageRepository: PackageRepository,
		private readonly emailService: EmailService,
	) { }

	async getAll({ page, limit }: { page: number; limit: number }) {
		try {
			const result = await this.consultationRequestRepository.getAll({ page, limit })
			return SuccessResponse('Get all consultation requests successfully', result)
		} catch (error) {
			this.logger.error(error.message)
			throw error
		}
	}

	async getById(id: number) {
		try {
			const result = await this.consultationRequestRepository.getById(id)
			if (!result) return ConsultationRequestNotFound
			return SuccessResponse('Get consultation request successfully', result)
		} catch (error) {
			this.logger.error(error.message)
			throw error
		}
	}

	async create(body: CreateConsultationRequest) {
		try {
			const { name, email, phone, company_name, package_id, note } = body

			const existingEmail = await this.consultationRequestRepository.findUniqueByMail(email);
			if (existingEmail) {
				return EmailExistsError;
			}

			const isPackedExist = await this.packageRepository.isExistingPackage(package_id)
			if (!isPackedExist) return PackageNotFound

			// Send notification email to admin and customer
			const [adminEmailResult, customerEmailResult] = await Promise.all([
				this.emailService.sendSalesConsultationRequestEmail(
					{
						name,
						email,
						phone,
						company: company_name || 'N/A',
						package_name: isPackedExist.name,
						note: note || 'N/A'
					}
				),
				this.emailService.sendCustomerConsultationRequestEmail(
					{
						name,
						email,
						phone
					}
				)
			])
			this.logger.log(`Admin email sent: ${adminEmailResult.data?.id}, Customer email sent: ${customerEmailResult.data?.id}`)

			if (!adminEmailResult.data || !customerEmailResult.data) {
				this.logger.warn('One or both emails failed to send');
				throw new Error('Failed to send notification emails');
			}

			await this.consultationRequestRepository.create(body)
			return SuccessResponse('Create consultation request successfully')
		} catch (error) {
			this.logger.error(error.message)
			throw error
		}
	}

	async update(id: number, body: UpdateConsultationRequest) {
		try {
			if (body.package_id) {
				const isPackedExist = await this.packageRepository.isExistingPackage(body.package_id)
				if (!isPackedExist) return PackageNotFound
			}
			const existing = await this.consultationRequestRepository.getById(id)
			if (!existing) return ConsultationRequestNotFound
			const result = await this.consultationRequestRepository.update(id, body)
			return SuccessResponse('Update consultation request successfully', result)
		} catch (error) {
			this.logger.error(error.message)
			throw error
		}
	}

	async delete(id: number) {
		try {
			const existing = await this.consultationRequestRepository.getById(id)
			if (!existing) return ConsultationRequestNotFound
			const result = await this.consultationRequestRepository.delete(id)
			return SuccessResponse('Delete consultation request successfully', result)
		} catch (error) {
			this.logger.error(error.message)
			throw error
		}
	}
}

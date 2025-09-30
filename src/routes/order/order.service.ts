import { Injectable, Logger } from '@nestjs/common'
import { OrderRepository } from './order.repo'
import { PackageRepository } from '../package/package.repo'
import { CreateOrderType, UpdateOrderType } from './order.model'
import { SuccessResponse } from 'src/shared/sucess'
import { OrderNotFound, PackageNotFound, WorkspaceNotFound } from './order.error'
import { SharedWorkspaceRepository } from 'src/shared/repositories/shared-workspace.repo'

@Injectable()
export class OrderService {
	private readonly logger = new Logger(OrderService.name)

	constructor(
		private readonly orderRepository: OrderRepository,
		private readonly packageRepository: PackageRepository,
		private readonly sharedWorkspaceRepository: SharedWorkspaceRepository,
	) {}

	async getAll({ page, limit }: { page: number; limit: number }) {
		try {
			const result = await this.orderRepository.getAll({ page, limit })
			return SuccessResponse('Get all orders successfully', result)
		} catch (error) {
			this.logger.error(error.message)
			throw error
		}
	}

	async getById(id: string) {
		try {
			const result = await this.orderRepository.getById(id)
			if (!result) return OrderNotFound
			return SuccessResponse('Get order successfully', result)
		} catch (error) {
			this.logger.error(error.message)
			throw error
		}
	}

	async create(body: CreateOrderType) {
		try {
			const isPackageExist = await this.packageRepository.isExistingPackage(body.package_id)
			if (!isPackageExist) return PackageNotFound

			if (body.workspace_id) {
				const isWorkspaceExist = await this.sharedWorkspaceRepository.findUnique({id: body.workspace_id})
				if (!isWorkspaceExist) return WorkspaceNotFound
			}

			const result = await this.orderRepository.create({
				workspace_id: body.workspace_id,
				package_id: body.package_id,
				total_amount: isPackageExist.price,
			})
			
			return SuccessResponse('Create order successfully', result)
		} catch (error) {
			this.logger.error(error.message)
			throw error
		}
	}

	async update(id: string, body: UpdateOrderType) {
		try {
			if (body.package_id) {
				const isPackageExist = await this.packageRepository.isExistingPackage(body.package_id)
				if (!isPackageExist) return PackageNotFound
			}
			if (body.workspace_id) {
				const isWorkspaceExist = await this.sharedWorkspaceRepository.findUnique({id: body.workspace_id})
				if (!isWorkspaceExist) return WorkspaceNotFound
			}
			const existing = await this.orderRepository.getById(id)
			if (!existing) return OrderNotFound
			const result = await this.orderRepository.update(id, body)
			return SuccessResponse('Update order successfully', result)
		} catch (error) {
			this.logger.error(error.message)
			throw error
		}
	}

	async delete(id: string) {
		try {
			const existing = await this.orderRepository.getById(id)
			if (!existing) return OrderNotFound
			const result = await this.orderRepository.delete(id)
			return SuccessResponse('Delete order successfully', result)
		} catch (error) {
			this.logger.error(error.message)
			throw error
		}
	}
}

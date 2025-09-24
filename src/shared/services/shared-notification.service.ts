import { NotFoundException, BadRequestException, Injectable, Logger, Inject } from '@nestjs/common';
import { SuccessResponse } from 'src/shared/sucess';
import { SharedNotificationRepository } from '../repositories/shared-notification.repo';
import { NotificationCreateType, NotificationUpdateType } from '../models/shared-notification.model';
import { NotificationErrors, UserNotFoundException } from '../error';
import { SharedUserRepository } from '../repositories/shared-user.repo';
import { NotificationGateway } from 'src/web-socket/notification.gateway';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SharedNotificationService {
	private readonly logger = new Logger(SharedNotificationService.name);

	constructor(
		private readonly sharedNotificationRepository: SharedNotificationRepository,
		private readonly sharedUserRepository: SharedUserRepository,
		@Inject(EventEmitter2) private eventEmitter: EventEmitter2,
	) { }

	async checkUserExists(user_id: string) {
		const user = await this.sharedUserRepository.findUnique({ id: user_id });
		if (!user) throw UserNotFoundException;
	}

	// Create a new notification
	async create(data: NotificationCreateType) {
		await this.checkUserExists(data.user_id);
		const result = await this.sharedNotificationRepository.create(data);
		if (!result) {
			throw new BadRequestException(NotificationErrors.CreateFailed);
		}

		return SuccessResponse('Create notification successfully', result);
	}

	// Mark all notifications as read for a specific user
	async markAllAsReadByUserId(userId: string) {
		await this.checkUserExists(userId);

		const result = await this.sharedNotificationRepository.updateMany(
			{ user_id: userId, is_read: false },
			{ is_read: true }
		);

		if (!result) {
			throw new NotFoundException(NotificationErrors.MarkAllAsReadFailed);
		}

		if (result.count === 0) {
			throw new NotFoundException(NotificationErrors.NoNotificationsToMarkAsRead);
		}

		return SuccessResponse('Marked all notifications as read');
	}

	// Mark a specific notification as read for a specific user
	async markAsReadByUserIdAndId(userId: string, id: number) {
		try {
			await this.checkUserExists(userId);

			const result = await this.sharedNotificationRepository.updateByIdAndUserId(
				id, userId, { is_read: true }
			);

			if (!result) {
				throw new NotFoundException(NotificationErrors.MarkAsReadFailed);
			}

			return SuccessResponse('Marked notification as read');
		} catch (error) {
			this.logger.error(error.message);
			throw error;
		}
	}

	// Get all notifications for a specific user
	async findAllByUserId(user_id: string) {
		await this.checkUserExists(user_id);
		const result = await this.sharedNotificationRepository.findAllByUserId(user_id);

		return SuccessResponse('Get notification list by user successfully', result);
	}

	// Get all notifications
	async findAll(page: number, pageSize: number) {
		const result = await this.sharedNotificationRepository.findAllWithPagination(page, pageSize);
		return SuccessResponse('Get notification list successfully', result);
	}

	// Get a notification by its ID
	async findById(id: number) {
		const noti = await this.sharedNotificationRepository.findById(id);
		if (!noti) throw new NotFoundException(NotificationErrors.NotFound);
		return SuccessResponse('Get notification successfully', noti);
	}

	// Update a notification by its ID
	async update(id: number, data: NotificationUpdateType) {
		try {
			const updated = await this.sharedNotificationRepository.update(id, { ...data });
			if (!updated) throw new NotFoundException(NotificationErrors.NotFound);
			return SuccessResponse('Update notification successfully', updated);
		} catch (err) {
			throw new BadRequestException(NotificationErrors.UpdateFailed);
		}
	}

	// Delete a notification by its ID
	async delete(id: number) {
		try {
			const deleted = await this.sharedNotificationRepository.delete(id);
			if (!deleted) throw new NotFoundException(NotificationErrors.NotFound);
			return SuccessResponse('Delete notification successfully', { id });
		} catch (err) {
			throw new BadRequestException(NotificationErrors.DeleteFailed);
		}
	}

	async createAndSend(data: NotificationCreateType) {
		const notification = await this.sharedNotificationRepository.create(data);
		const count = await this.sharedNotificationRepository.countUnread(data.user_id);

		this.eventEmitter.emit('notification.created', {
			userId: data.user_id,
			notification,
			unreadCount: count,
		});

		return notification;
	}

	async countUnread(user_id: string) {
		return await this.sharedNotificationRepository.countUnread(user_id);
	}

}

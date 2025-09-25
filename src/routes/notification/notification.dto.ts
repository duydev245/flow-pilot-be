import { createZodDto } from 'nestjs-zod';
import { NotificationCreateSchema, NotificationUpdateSchema } from 'src/shared/models/shared-notification.model';

export class NotificationCreateDto extends createZodDto(NotificationCreateSchema) {}
export class NotificationUpdateDto extends createZodDto(NotificationUpdateSchema) {}

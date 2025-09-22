import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { SharedNotificationService } from 'src/shared/services/shared-notification.service';

@Module({
  controllers: [NotificationController],
  providers: [SharedNotificationService],
})
export class NotificationModule { }

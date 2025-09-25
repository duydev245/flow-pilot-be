import { forwardRef, Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { SharedModule } from 'src/shared/shared.module';

@Module({
    imports: [SharedModule],
    providers: [NotificationGateway],
    exports: [NotificationGateway],
})
export class WebSocketModule { }

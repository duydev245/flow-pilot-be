import { OnEvent } from '@nestjs/event-emitter';
import {
    WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket,
    OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SharedNotificationService } from 'src/shared/services/shared-notification.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(private readonly notificationService: SharedNotificationService) { }

    handleConnection(socket: Socket) {
        const user = (socket as any).user;
        if (!user) return socket.disconnect();

        socket.join(`user:${user.user_id}`);
        console.log(`User ${user.user_id} connected to WebSocket`);
    }

    handleDisconnect(socket: Socket) { }

    @SubscribeMessage('notify:subscribe')
    async handleSubscribe(@ConnectedSocket() socket: Socket) {
        const user = (socket as any).user;
        const count = await this.notificationService.countUnread(user.user_id);
        socket.emit('notify:count', count);
        return { event: 'notify:subscribed' };
    }

    @SubscribeMessage('notify:read')
    async handleRead(@ConnectedSocket() socket: Socket, @MessageBody() notificationId: number) {
        const user = (socket as any).user;
        await this.notificationService.markAsReadByUserIdAndId(user.user_id, notificationId);
        socket.emit('notify:updated', { id: notificationId });
    }

    @SubscribeMessage('notify:readAll')
    async handleReadAll(@ConnectedSocket() socket: Socket) {
        const user = (socket as any).user;
        await this.notificationService.markAllAsReadByUserId(user.user_id);
        socket.emit('notify:updated', { all: true });
    }

    @OnEvent('notification.created')
    handleNotificationCreated(payload: { userId: string; notification: any; unreadCount: number }) {
        this.emitNewNotification(payload.userId, payload.notification);
        this.emitUnreadCount(payload.userId, payload.unreadCount);
    }

    emitNewNotification(userId: string, notification: any) {
        this.server.to(`user:${userId}`).emit('notify:new', notification);
    }

    emitUnreadCount(userId: string, count: number) {
        this.server.to(`user:${userId}`).emit('notify:count', count);
    }
}

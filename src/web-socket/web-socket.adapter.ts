import { IoAdapter } from '@nestjs/platform-socket.io';
import { Injectable } from '@nestjs/common';
import { ServerOptions, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import envConfig from 'src/shared/config';

@Injectable()
export class WebSocketAdapter extends IoAdapter {

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);

    server.use((socket: Socket, next) => {
      const accessToken = socket.handshake.headers.access_token || socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];

      if (!accessToken) return next(new Error('Authentication error'));

      try {
        const payload = jwt.verify(accessToken, envConfig.ACCESS_TOKEN_SECRET);
        (socket as any).user = payload;
        next();
      } catch {
        next(new Error('Authentication error'));
      }
    });

    return server;
  }
}

import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('Gateway Log');

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(`message: recieved ${message}`);
    const rooms = [...socket.rooms].slice(0);
    this.server.to(rooms[1]).emit('update', message);
  }

  @SubscribeMessage('joinRoom')
  joinOrUpdateRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(`joinRoom: ${socket.id} joined ${roomId}`);
    const rooms = [...socket.rooms].slice(0);
    if (rooms.length == 2) socket.leave(rooms[1]);
    socket.join(roomId);
  }
}

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
    this.logger.log(`message received: ${message}`);
    const rooms = [...socket.rooms].slice(0);
    this.server.to(rooms[1]).emit('update', message);
    // const rooms = [...socket.rooms];
    // rooms.forEach((room) => {
    //   this.server.to(room).emit('update', message);
    // });
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomID: string,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(`joinRoom: ${socket.id} joined ${roomID}`);
    const rooms = [...socket.rooms].slice(0);
    if (rooms.length == 2) socket.leave(rooms[1]);
    // // 既存の部屋を離脱
    // socket.rooms.forEach((room) => {
    //   socket.leave(room);
    // });
    // // 新しい部屋に参加
    socket.join(roomID);
  }
}

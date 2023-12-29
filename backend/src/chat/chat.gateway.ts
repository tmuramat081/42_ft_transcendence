import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
// import { User } from './page.tsx'; // Import the User class

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('Gateway Log');

  @SubscribeMessage('talk')
  handleMessage(
    @MessageBody() data: { roomID: string; sender: User; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    // const { roomID, message } = data;
    this.logger.log(
      `message received: ${data.roomID} ${data.sender} ${data.message}`,
    );
    // 送信者の部屋IDを取得
    const rooms = [...socket.rooms].slice(0);
    // 送信者の部屋以外に送信
    this.server.to(rooms[1]).emit('update', {
      roomID: data.roomID,
      sender: data.sender,
      message: data.message,
    });
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomID: string,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(`joinRoom: ${socket.id} joined ${roomID}`);
    const rooms = [...socket.rooms].slice(0);
    // 既に部屋に入っている場合は退出
    if (rooms.length == 2) socket.leave(rooms[1]);
    socket.join(roomID);
  }
}

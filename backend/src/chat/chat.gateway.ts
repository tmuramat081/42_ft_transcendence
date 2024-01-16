import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface User {
  ID: string;
  name: string;
  icon: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('Gateway Log');
  private roomList: { [key: string]: string } = {};

  @SubscribeMessage('talk')
  handleMessage(
    @MessageBody() data: { roomID: string; sender: User; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(
      `message received: ${data.roomID} ${data.sender.ID} ${data.message}`,
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

  @SubscribeMessage('createRoom')
  handleCreateRoom(
    @MessageBody() room: { sender: User; name: string },
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(`${room.sender} createRoom: ${room.name}`);
    // 同じ名前のルームが存在しないか確認
    if (!this.roomList[room.name]) {
      this.roomList[room.name] = room.name; // 一意なキーとしてルーム名を使用
      socket.join(room.name);
      console.log('Room created. Emitting updated roomList:', this.roomList);
      this.server.emit('roomList', this.roomList); // ルームリストを更新して全クライアントに通知
    } else {
      socket.emit('roomError', 'Room with the same name already exists.');
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(`joinRoom: ${socket.id} joined ${roomName}`);
    const rooms = [...socket.rooms].slice(0);
    // 既に部屋に入っている場合は退出
    if (rooms.length == 2) socket.leave(rooms[1]);
    socket.join(roomName);
  }

  @SubscribeMessage('deleteRoom')
  handleDeleteRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(`${socket.id} deleteRoom: ${roomName}`);
    delete this.roomList[roomName];
    this.server.emit('roomList', Object.keys(this.roomList)); // ルームリストを更新して全クライアントに通知
  }
}

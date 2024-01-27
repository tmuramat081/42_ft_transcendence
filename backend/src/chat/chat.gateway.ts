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

interface ChatMessage {
  user: string;
  photo: string;
  text: string;
  timestamp: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('Gateway Log');
  private roomList: { [key: string]: string } = {};
  private roomChatLogs: { [roomId: string]: ChatMessage[] } = {};

  @SubscribeMessage('talk')
  handleMessage(
    @MessageBody() data: { roomID: string; sender: User; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(
      `message received: ${data.roomID} ${data.sender.ID} ${data.message}`,
    );

    const timestamp = new Date().toLocaleString();

    // チャットログを保存
    if (!this.roomChatLogs[data.roomID]) {
      this.roomChatLogs[data.roomID] = [];
    }
    this.roomChatLogs[data.roomID].push({
      user: data.sender.ID,
      photo: data.sender.icon,
      text: data.message,
      timestamp,
    });

    // 送信者の部屋IDを取得
    const rooms = [...socket.rooms].slice(0);
    // 送信者の部屋以外に送信
    this.server.to(rooms[1]).emit('update', {
      roomID: data.roomID,
      sender: data.sender,
      message: data.message,
      timestamp,
    });
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(
    @MessageBody() create: { sender: User; roomID: string },
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(`${create.sender.name} createRoom: ${create.roomID}`);

    // ルーム名が空かどうかを確認
    if (!create.roomID.trim()) {
      socket.emit('roomError', 'Room name cannot be empty.');
      return; // 空の場合は処理を中断
    }

    // 同じ名前のルームが存在しないか確認
    if (!this.roomList[create.roomID]) {
      this.roomList[create.roomID] = create.roomID; // 一意なキーとしてルーム名を使用
      socket.join(create.roomID);
      console.log('Room created. Emitting updated roomList:', this.roomList);
      this.server.emit('roomList', this.roomList); // ルームリストを更新して全クライアントに通知
    } else {
      socket.emit('roomError', 'Room with the same name already exists.');
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() join: { sender: User; room: string },
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(`joinRoom: ${join.sender.name} joined ${join.room}`);
    console.log('joinRoom: ', join.sender.name, 'joined', join.room);
    const rooms = [...socket.rooms].slice(0);
    // 既に部屋に入っている場合は退出
    if (rooms.length == 2) socket.leave(rooms[1]);
    socket.join(join.room);
  }

  @SubscribeMessage('deleteRoom')
  handleDeleteRoom(@MessageBody() delet: { sender: User; room: string }) {
    this.logger.log(`${delet.sender.name} deleteRoom: ${delet.room}`);
    const updatedRoomList = Object.fromEntries(
      Object.entries(this.roomList).filter(([key]) => key !== delet.room),
    );
    this.roomList = updatedRoomList;
    this.server.emit('roomList', this.roomList);
  }

  @SubscribeMessage('getRoomList')
  handleGetLoomList(
    @MessageBody() SocketId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(`Client connected: ${socket.id}`);
    this.server.emit('roomList', this.roomList);
  }
}

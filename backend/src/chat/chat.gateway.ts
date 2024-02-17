/* eslint-disable */
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatLog } from './entities/chatlog.entity';
import { Room } from './entities/room.entity';
import { User } from '../users/entities/user.entity';

/*
Table user {
  user_id integer [pk]
  user_name varchar
  password varchar
  email varchar
  icon varchar
  created_at date
  updated_at date
}
*/

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('Gateway Log');

  constructor(
    @InjectRepository(ChatLog)
    private chatLogRepository: Repository<ChatLog>,

    @InjectRepository(Room) // Room リポジトリを注入
    private roomRepository: Repository<Room>, // Room エンティティのリポジトリ
  ) {}

  @SubscribeMessage('talk')
  async handleMessage(
    @MessageBody() data: { roomID: string; sender: User; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(`message received: ${data.roomID} ${data.sender} ${data.message}`);

    const timestamp = new Date().toLocaleString();

    // チャットログを保存
    const chatLog = new ChatLog();
    chatLog.roomID = data.roomID;
    chatLog.sender = data.sender.userName;
    chatLog.message = data.message;
    chatLog.timestamp = timestamp;
    await this.chatLogRepository.save(chatLog); // チャットログをデータベースに保存

    // socket.broadcast.to(data.roomID).emit('update', {
    // 送信者の部屋IDを取得
    const rooms = [...socket.rooms].slice(0);
    // 送信者の部屋以外に送信
    this.server.to(rooms[1]).emit('update', {
      roomID: data.roomID,
      sender: data.sender.userName,
      message: data.message,
      timestamp,
    });
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @MessageBody() create: { sender: User; roomName: string },
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(`${create.sender.userName} createRoom: ${create.roomName}`);

    // ルーム名が空かどうかを確認
    if (!create.roomName.trim()) {
      socket.emit('roomError', 'Room name cannot be empty.');
      return; // 空の場合は処理を中断
    }

    // 同じ名前のルームが存在しないか確認
    const existingRoom = await this.roomRepository.findOne({
      where: { roomName: create.roomName },
    });
    if (!existingRoom) {
      const room = new Room();
      room.roomName = create.roomName; // ルーム名として入力された値を使用
      await this.roomRepository.save(room); // 新しいルームをデータベースに保存
      socket.join(create.roomName);
      console.log('Room created. Emitting updated roomList:', room);
      this.server.emit('roomList', room); // ルームリストを更新して全クライアントに通知
    } else {
      socket.emit('roomError', 'Room with the same name already exists.');
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() join: { sender: User; room: string },
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(`joinRoom: ${join.sender.userName} joined ${join.room}`);
    console.log('joinRoom: ', join.sender.userName, 'joined', join.room);
    const rooms = [...socket.rooms].slice(0);
    // 既に部屋に入っている場合は退出
    if (rooms.length == 2) socket.leave(rooms[1]);
    socket.join(join.room);
  }

  @SubscribeMessage('deleteRoom')
  async handleDeleteRoom(@MessageBody() delet: { sender: User; room: string }) {
    this.logger.log(`${delet.sender.userName} deleteRoom: ${delet.room}`);

    // データベースから指定のルームを削除
    const deletedRoom = await this.roomRepository.findOne({
      where: { roomName: delet.room },
    });
    if (deletedRoom) {
      await this.roomRepository.remove(deletedRoom);
      this.logger.log(`Room ${delet.room} has been deleted from the database.`);
    } else {
      this.logger.error(`Room ${delet.room} not found in the database.`);
    }

    // 新しい roomList を取得してコンソールに出力
    const updatedRoomList = await this.roomRepository.find();
    this.logger.log('Updated roomList:', updatedRoomList);

    this.server.emit('roomList', updatedRoomList);
  }

  // @SubscribeMessage('getRoomList')
  // handleGetLoomList(
  //   @MessageBody() SocketId: string,
  //   @ConnectedSocket() socket: Socket,
  // ) {
  //   this.logger.log(`Client connected: ${socket.id}`);
  //   this.server.emit('roomList', this.roomList);
  // }
}

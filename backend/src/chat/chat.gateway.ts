import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, HttpException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatLog } from './entities/chatlog.entity';
import { Room } from './entities/room.entity';
// import { Sender, ChatMessage } from '../frontend/src/chat/page';

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
    this.logger.log(
      `message received: ${data.roomID} ${data.sender.ID} ${data.message}`,
    );

    const timestamp = new Date().toLocaleString();

    // チャットログを保存
    const chatLog = new ChatLog();
    chatLog.roomID = data.roomID;
    chatLog.userID = data.sender.ID;
    chatLog.message = data.message;
    chatLog.timestamp = timestamp;
    await this.chatLogRepository.save(chatLog); // チャットログをデータベースに保存

    // socket.broadcast.to(data.roomID).emit('update', {
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
  async handleCreateRoom(
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
    const existingRoom = await this.roomRepository.findOne({
      where: { roomName: create.roomID },
    });
    if (!existingRoom) {
      const room = new Room();
      room.roomID = create.roomID;
      room.roomName = create.roomID; // ルーム名として入力された値を使用
      await this.roomRepository.save(room); // 新しいルームをデータベースに保存
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

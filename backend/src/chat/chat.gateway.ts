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

export interface Sender {
  ID: string;
  name: string;
  icon: string;
}

export interface ChatMessage {
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

  constructor(
    @InjectRepository(ChatLog)
    private chatLogRepository: Repository<ChatLog>,

    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  @SubscribeMessage('talk')
  async handleMessage(
    @MessageBody() data: { selectedRoom: string; sender: Sender; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (
        !data.sender ||
        !data.sender.ID ||
        !data.sender.name ||
        !data.sender.icon ||
        !data.message
      ) {
        this.logger.error('Invalid chat message data:', data);
        return;
      }
      this.logger.log(
        `${data.selectedRoom} received ${data.message} from ${data.sender.name} ${data.sender.ID}`,
      );

      // チャットログを保存
      const chatLog = new ChatLog();
      chatLog.roomName = data.selectedRoom;
      chatLog.sender = data.sender.ID;
      chatLog.icon = data.sender.icon;
      chatLog.message = data.message;
      chatLog.timestamp = new Date().toLocaleString();
      await this.chatLogRepository.save(chatLog); // チャットログをデータベースに保存
      this.logger.log(`Saved chatLog: ${JSON.stringify(chatLog)}`);
      // 送信者の部屋IDを取得
      // const rooms = [...socket.rooms].slice(0);
      // 送信者の部屋以外に送信
      // this.server.to(rooms[1]).emit('update', chatLog);

      const chatMessage: ChatMessage = {
        user: data.sender.ID,
        photo: data.sender.icon,
        text: data.message,
        timestamp: chatLog.timestamp,
      };

      this.server.to(data.selectedRoom).emit('update', chatMessage);
    } catch (error) {
      this.logger.error(`Error handling message: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @MessageBody() create: { sender: Sender; roomName: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(`createRoom: ${create.sender.name} create ${create.roomName}`);
      // ルーム名が空かどうかを確認
      if (!create.roomName || !create.roomName.trim()) {
        this.logger.error('Invalid room name:', create.roomName);
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
        // this.logger.log(`Creating room: ${room.roomName}`);
        await this.roomRepository.save(room); // 新しいルームをデータベースに保存
        socket.join(create.roomName);
        const rooms = await this.roomRepository.find();
        rooms.forEach((room) => {
          this.logger.log(`Room: ${JSON.stringify(room)}`);
        });
        this.server.emit('roomList', rooms); // ルームリストを更新して全クライアントに通知
      } else {
        socket.emit('roomError', 'Room with the same name already exists.');
      }
    } catch (error) {
      this.logger.error(`Error creating room: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() join: { sender: Sender; room: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(`joinRoom: ${join.sender.name} joined ${join.room}`);
      const rooms = [...socket.rooms].slice(0);
      // 既に部屋に入っている場合は退出
      if (rooms.length == 2) socket.leave(rooms[1]);
      // データベースから部屋を取得
      const room = await this.roomRepository.findOne({ where: { roomName: join.room } });
      // 参加者リストを更新
      if (room) {
        if (!room.roomParticipants) {
          room.roomParticipants = [];
        }
        room.roomParticipants.push(join.sender.ID);
        await this.roomRepository.save(room);
      } else {
        this.logger.error(`Room ${join.room} not found in the database.`);
      }
      // 参加者リストを取得してクライアントに送信
      const updatedRoom = await this.roomRepository.findOne({ where: { roomName: join.room } });
      if (updatedRoom) {
        this.server.to(join.room).emit('roomParticipants', updatedRoom.roomParticipants);
      } else {
        this.logger.error(`Error getting updated room.`);
      }
      // ソケットにルームに参加させる
      socket.join(join.room);
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.logger.error(`Error joining room: ${errorMessage}`);
      throw error;
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() leave: { sender: Sender; room: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(`leaveRoom: ${leave.sender.name} left ${leave.room}`);
      // データベースから部屋を取得
      const room = await this.roomRepository.findOne({ where: { roomName: leave.room } });

      // 参加者リストを更新
      if (room) {
        if (room.roomParticipants) {
          room.roomParticipants = room.roomParticipants.filter((id) => id !== leave.sender.ID);
          await this.roomRepository.save(room);
        }
      } else {
        this.logger.error(`Room ${leave.room} not found in the database.`);
      }

      // 更新された参加者リストを取得してクライアントに送信
      const updatedRoom = await this.roomRepository.findOne({ where: { roomName: leave.room } });
      if (updatedRoom) {
        this.server.to(leave.room).emit('roomParticipants', updatedRoom.roomParticipants);
      } else {
        this.logger.error(`Error getting updated room.`);
      }

      // ソケットからルームを退出させる
      const rooms = Object.keys(socket.rooms);
      if (rooms.includes(leave.room)) {
        socket.leave(leave.room);
      }
    } catch (error) {
      this.logger.error(`Error leaving room: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('deleteRoom')
  async handleDeleteRoom(@MessageBody() delet: { sender: Sender; room: string }) {
    try {
      this.logger.log(`${delet.sender.name} deleted Room: ${delet.room}`);

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
    } catch (error) {
      this.logger.error(`Error deleting room: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('getRoomList')
  async handleGetRoomList(@MessageBody() socketId: string, @ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`Client connected: ${socket.id}`);
      // データベースからルームリストを取得
      const roomList = await this.roomRepository.find();
      // ルームリストをクライアントに送信
      socket.emit('roomList', roomList);
    } catch (error) {
      this.logger.error(`Error getting room list: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('getRoomParticipants')
  async handleGetRoomParticipants(
    @MessageBody() roomName: string,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(`getRoomParticipants: ${roomName}`);
      // データベースから指定された部屋の参加者リストを取得
      const room = await this.roomRepository.findOne({ where: { roomName } });
      if (room) {
        // 参加者リストをクライアントに送信
        socket.emit('roomParticipants', room.roomParticipants);
      } else {
        this.logger.error(`Room ${roomName} not found in the database.`);
      }
    } catch (error) {
      this.logger.error(`Error getting room participants: ${(error as Error).message}`);
      throw error;
    }
  }
}

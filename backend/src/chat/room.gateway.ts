/* eslint-disable */
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
// import { UsersService } from '../users/users.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatLog } from './entities/chatLog.entity';
import { Room } from './entities/room.entity';
import { User } from '../users/entities/user.entity';
import { DmLog } from './entities/dmLog.entity';
import { OnlineUsers } from './entities/onlineUsers.entity';
import { GameRoom } from '../games/entities/gameRoom.entity';
import { UserInfo, ChatMessage, formatDate } from './tools';

@WebSocketGateway({ cors: { origin: '*' } })
export class RoomGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('Gateway Log');

  constructor(
    @InjectRepository(ChatLog)
    private chatLogRepository: Repository<ChatLog>,

    @InjectRepository(Room)
    private roomRepository: Repository<Room>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(DmLog)
    private dmLogRepository: Repository<DmLog>,

    @InjectRepository(OnlineUsers)
    private onlineUsersRepository: Repository<OnlineUsers>,

    @InjectRepository(GameRoom)
    private gameRoomRepository: Repository<GameRoom>,

    // private readonly usersService: UsersService,
  ) {}

  @SubscribeMessage('getUserCurrent')
  async handle(@MessageBody() user: User, @ConnectedSocket() socket: Socket) {
    try {
      // データベースからuser.userIdと同じユーザーを取得
      const userData = await this.userRepository.findOne({
        where: {
          userId: user.userId,
        },
      });
      if (User) {
        this.server.to(socket.id).emit('user', userData);
      } else {
        this.logger.error('No user found');
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() join: { user: User; room: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(`joinRoom: ${join.user.userName} joined ${join.room}`);
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
        // 参加者が100人を超える場合はエラーを返す
        if (room.roomParticipants.length >= 100) {
          this.logger.error('Room is full');
          socket.emit('roomError', 'Room is full.');
          return;
        }
        // ユーザーが存在してないか確認
        const existingUser = room.roomParticipants.find(
          (participant) => participant.name === join.user.userName,
          (participant) => participant.id === join.user.userId,
        );
        if (!existingUser) {
          // userRepositoryからユーザー情報を取得して追加
          const user = await this.userRepository.findOne({
            where: { userId: join.user.userId },
          });
          if (!user) {
            this.logger.error(`User ${join.user.userName} not found in the database.`);
            return;
          }
          room.roomParticipants.push({
            id: user.userId,
            name: user.userName,
            icon: user.icon,
          });
        }
        await this.roomRepository.save(room);
      } else {
        this.logger.error(`Room ${join.room} not found in the database.`);
      }
      // ソケットにルームに参加させる
      socket.join(join.room);
      // 参加者リストを取得してクライアントに送信
      const updatedRoom = await this.roomRepository.findOne({ where: { roomName: join.room } });
      if (updatedRoom) {
        // updatedRoom.roomParticipantsをUserInfoに変換
        const roomParticipants: UserInfo[] = updatedRoom.roomParticipants.map((participant) => {
          return {
            userId: participant.id,
            userName: participant.name,
            icon: participant.icon,
          };
        });
        this.server.to(join.room).emit('roomParticipants', roomParticipants);
      } else {
        this.logger.error(`Error getting updated room.`);
      }
      // チャットログを取得してクライアントに送信
      const chatLogs = await this.chatLogRepository.find({ where: { roomName: join.room } });
      if (chatLogs) {
        this.logger.log(`Chat logs: ${JSON.stringify(chatLogs)}`);
        // chatLogsをchatmessage[]に変換
        const chatMessages: ChatMessage[] = chatLogs.map((log) => {
          return {
            user: log.sender,
            photo: log.icon,
            text: log.message,
            timestamp: log.timestamp,
          };
        });
        this.server.to(join.room).emit('chatLogs', chatMessages);
      } else {
        this.logger.error(`Error getting chat logs.`);
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.logger.error(`Error joining room: ${errorMessage}`);
      throw error;
    }
  }

  @SubscribeMessage('talk')
  async handleMessage(
    @MessageBody() data: { selectedRoom: string; currentUser: User; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      // this.logger.log(`talk: ${data.user.userName} said ${data.message} in ${data.room}`);
      if (!data.selectedRoom || !data.currentUser || !data.message) {
        this.logger.error('Invalid chat message data:', data);
        this.logger.log(
          `talk: ${data.currentUser.userName} said ${data.message} in ${data.selectedRoom}`,
        );
        return;
      }
      this.logger.log(
        `${data.selectedRoom} received ${data.message} from ${data.currentUser.userName}`,
      );

      // チャットログを保存
      const chatLog = new ChatLog();
      chatLog.roomName = data.selectedRoom;
      chatLog.sender = data.currentUser.userName;
      chatLog.icon = data.currentUser.icon;
      chatLog.message = data.message;
      chatLog.timestamp = formatDate(new Date());
      await this.chatLogRepository.save(chatLog);
      this.logger.log(`Saved chatLog: ${JSON.stringify(chatLog)}`);

      // チャットログを取得
      const chatLogs = await this.chatLogRepository.find({
        where: { roomName: data.selectedRoom },
      });
      this.logger.log(`Chat logs: ${JSON.stringify(chatLogs)}`);
      // chatLogsをchatmessage[]に変換
      const chatMessages: ChatMessage[] = chatLogs.map((log) => {
        return {
          user: log.sender,
          photo: log.icon,
          text: log.message,
          timestamp: log.timestamp,
        };
      });
      this.server.to(data.selectedRoom).emit('chatLogs', chatMessages);
    } catch (error) {
      this.logger.error(`Error handling message: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() leave: { user: User; room: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(`leaveRoom: ${leave.user.userName} left ${leave.room}`);
      // データベースから部屋を取得
      const room = await this.roomRepository.findOne({ where: { roomName: leave.room } });

      // 参加者リストを更新
      if (room) {
        if (room.roomParticipants) {
          room.roomParticipants = room.roomParticipants.filter(
            (participant) => participant.name !== leave.user.userName,
          );
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
  async handleDeleteRoom(@MessageBody() delet: { user: User; room: string }) {
    try {
      this.logger.log(`${delet.user.userName} deleted Room: ${delet.room}`);

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

      this.server.emit('roomList', updatedRoomList);
    } catch (error) {
      this.logger.error(`Error deleting room: ${(error as Error).message}`);
      throw error;
    }
  }
}

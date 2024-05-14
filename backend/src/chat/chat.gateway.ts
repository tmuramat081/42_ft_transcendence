/* eslint-disable */
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UsersService } from '../users/users.service';
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
export class ChatGateway {
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

    private readonly usersService: UsersService,
  ) {}

  @SubscribeMessage(`getLoginUser`)
  async handleGetCurrentUser(@MessageBody() user: User, @ConnectedSocket() socket: Socket) {
    try {
      const userId = user.userId;
      const loginUser = await this.userRepository.findOne({ where: { userId: Number(userId) } });
      if (!loginUser) {
        this.logger.error(`User not found: ${userId}`);
        return;
      }
      socket.emit('loginUser', loginUser);
    } catch (error) {
      this.logger.error(`Error getting user: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('getRoomList')
  async handleGetRoomList(@MessageBody() LoginUser: User, @ConnectedSocket() socket: Socket) {
    try {
      // データベースからルームリストを取得
      const roomList = await this.roomRepository.find();
      // this.logger.log(`Room list: ${JSON.stringify(roomList)}`);
      // ルームリストをクライアントに送信
      socket.emit('roomList', roomList);
    } catch (error) {
      this.logger.error(`Error getting room list: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('getOnlineUsers')
  async handleGetOnlineUsers(@MessageBody() LoginUser: User, @ConnectedSocket() socket: Socket) {
    try {
      if (!LoginUser || !LoginUser.userId || !LoginUser.userName) {
        throw new Error('Invalid sender data.');
      }
      // usersService.loginUserIdsからloninUserのリストを取得
      const onlineUserIds: number[] = await this.usersService.loginUserIds;

      // onlineUserIdsからユーザー情報を取得
      const onlineUsers: User[] = await this.userRepository.findByIds(onlineUserIds);

      // onlineUsers[]をUserInfo[]に変換
      const onlineUsersInfo: UserInfo[] = onlineUsers.map((user) => {
        return {
          userId: user.userId,
          userName: user.userName,
          icon: user.icon,
        };
      });
      this.logger.log(`Online users info: ${JSON.stringify(onlineUsersInfo)}`);

      // sender以外のonlineUsersInfoをクライアントに送信
      socket.emit(
        'onlineUsers',
        onlineUsersInfo.filter((user) => user.userId !== LoginUser.userId),
      );
    } catch (error) {
      this.logger.error(`Error getting online users: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @MessageBody() create: { LoginUser: User; roomName: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(`createRoom: ${create.LoginUser.userName} create ${create.roomName}`);
      // ルーム名が空かどうかを確認
      if (!create.roomName || !create.roomName.trim()) {
        this.logger.error('Invalid room name:', create.roomName);
        socket.emit('roomError', 'Room name cannot be empty.');
        return;
      }

      // 同じ名前のルームが存在しないか確認
      const existingRoom = await this.roomRepository.findOne({
        where: { roomName: create.roomName },
      });
      if (!existingRoom) {
        const room = new Room();
        room.roomName = create.roomName;
        room.roomParticipants = [];
        room.roomType = 'public';
        room.roomOwner = create.LoginUser.userId;
        room.createdAt = new Date();
        await this.roomRepository.save(room);
        socket.join(create.roomName);
        const rooms = await this.roomRepository.find();
        rooms.forEach((room) => {
          this.logger.log(`Room: ${JSON.stringify(room)}`);
        });
        // ルームリストを更新して全クライアントに通知
        this.server.emit('roomList', rooms);
      } else {
        this.logger.error(`Room with the same name already exists: ${create.roomName}`);
        socket.emit('roomError', 'Room with the same name already exists.');
      }
    } catch (error) {
      this.logger.error(`Error creating room: ${(error as Error).message}`);
      throw error;
    }
  }
}

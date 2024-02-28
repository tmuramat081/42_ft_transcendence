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
import { CurrentUser } from './entities/currentUser.entity';
import { DirectMessage } from './entities/directMessage.entity';
import { OnlineUsers } from './entities/onlineUsers.entity';

export interface UserInfo {
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
export class DMGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('Gateway Log');
  // 現在のUserの情報を保持
  private currentUser: UserInfo = {
    ID: '',
    name: '',
    icon: '',
  };

  constructor(
    @InjectRepository(ChatLog)
    private chatLogRepository: Repository<ChatLog>,

    @InjectRepository(Room)
    private roomRepository: Repository<Room>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(CurrentUser)
    private currentUserRepository: Repository<CurrentUser>,

    @InjectRepository(DirectMessage)
    private directMessageRepository: Repository<DirectMessage>,

    @InjectRepository(OnlineUsers)
    private onlineUsersRepository: Repository<OnlineUsers>,
  ) {}

  @SubscribeMessage('getCurrentUser')
  async handleGetCurrentUser(@ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`getCurrentUser`);
      // データベースからcurrentUserを取得
      const currentUser = await this.currentUserRepository.findOne({});
      if (currentUser) {
        this.currentUser.ID = currentUser.userId;
        this.currentUser.name = currentUser.name;
        this.currentUser.icon = currentUser.icon;
        this.server.to(socket.id).emit('currentUser', this.currentUser);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}

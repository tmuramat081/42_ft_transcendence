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
      // データベースからonlineUsersを取得
      const onlineUsers = await this.onlineUsersRepository.find();
      if (onlineUsers) {
        this.logger.log(`onlineUsers found: ${JSON.stringify(onlineUsers)}`);
      } else {
        this.logger.error('No onlineUserd found');
      }
      // データベースからcurrentUserを取得
      const currentUser = await this.onlineUsersRepository.findOne({ where: { me: true } });
      if (currentUser) {
        this.logger.log(`currentUser found: ${JSON.stringify(currentUser)}`);
        this.server.to(socket.id).emit('currentUser', currentUser);
      } else {
        this.logger.error('No current user found');
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  // データベースからrecipientを取得
  @SubscribeMessage('getRecipient')
  async handleGetRecipient(@MessageBody() recipient: UserInfo, @ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`getRecipient: ${JSON.stringify(recipient)}`);
      const recipientUser = await this.onlineUsersRepository.findOne({
        where: { name: recipient.name },
      });
      if (recipientUser) {
        this.logger.log(`Recipient found: ${JSON.stringify(recipientUser)}`);
        this.server.to(socket.id).emit('recipient', recipientUser);
      } else {
        this.logger.error('No recipient found');
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SubscribeMessage('startDM')
  async handleStartDM(
    @MessageBody() payload: { sender: UserInfo; receiver: UserInfo },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (!payload.sender || !payload.receiver) {
        this.logger.error('Invalid DM data:', payload);
        return;
      }
      this.logger.log(`startDM: ${payload.sender.name} started DM with ${payload.receiver.name}`);

      // クライアントに送信
      // this.server.to(payload.sender.ID).emit('readytoDM', payload.receiver);
    } catch (error) {
      this.logger.error(`Error starting DM: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('sendDM')
  async handleSendDM(
    @MessageBody() payload: { sender: UserInfo; receiver: UserInfo; message: string },
  ) {
    try {
      if (!payload.sender || !payload.receiver || !payload.message) {
        console.error('Invalid DM data:', payload);
        return { success: false, message: 'Invalid DM data' };
      }
      this.logger.log(`sendDM: ${payload.sender.name} sent DM to ${payload.receiver.name}`);

      function formatDate(date: Date): string {
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Tokyo',
        };
        return date.toLocaleString('ja-JP', options);
      }

      // DirectMessageを作成して保存
      const directMessage = new DirectMessage();
      directMessage.senderName = payload.sender.name;
      directMessage.recipientName = payload.receiver.name;
      directMessage.message = payload.message;
      directMessage.timestamp = formatDate(new Date());
      await this.directMessageRepository.save(directMessage);
      this.logger.log(`Saved directMessage: ${JSON.stringify(directMessage)}`);

      // クライアントに送信
      this.server.to(payload.sender.ID).emit('updateDM', {
        user: payload.sender.name,
        photo: payload.sender.icon,
        text: payload.message,
        timestamp: directMessage.timestamp,
      });

      // 成功メッセージを返す
      return { success: true, message: 'DM sent successfully' };
    } catch (error) {
      console.error('Error sending DM:', error);
      return { success: false, message: 'Failed to send DM' };
    }
  }
}

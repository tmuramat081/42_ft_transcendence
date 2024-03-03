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
    this.logger.log(`sender:', ${JSON.stringify(payload.sender)}`);
    this.logger.log(`receiver:', ${JSON.stringify(payload.receiver)}`);
    try {
      if (!payload.sender || !payload.receiver) {
        this.logger.error('Invalid DM data:', payload);
        return;
      }
      this.logger.log(`startDM: ${payload.sender.name} started DM with ${payload.receiver.name}`);
      // 送信者と受信者のエンティティを取得
      // const senderUser = await this.onlineUsersRepository.findOne({
      //   where: { name: payload.sender.name },
      // });
      const recipient = await this.onlineUsersRepository.findOne({
        where: { name: payload.receiver.name },
      });

      // Userが存在しない場合はエラー
      // if (!senderUser) {
      //   this.logger.error(`Sender ${payload.sender.name} not found in the database.`);
      //   return;
      // }
      if (!recipient) {
        this.logger.error(`Recipient ${payload.receiver.name} not found in the database.`);
        return;
      }

      // クライアントに送信
      this.server.to(payload.sender.ID).emit('readytoDM', recipient);
    } catch (error) {
      this.logger.error(`Error starting DM: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('sendDM')
  async handleSendDM(
    @MessageBody() payload: { sender: string; receiver: string; message: string },
  ) {
    try {
      if (
        !payload.sender ||
        !payload.receiver ||
        !payload.message ||
        !payload.sender.trim() ||
        !payload.receiver.trim() ||
        !payload.message.trim()
      ) {
        console.error('Invalid DM data:', payload);
        return { success: false, message: 'Invalid DM data' };
      }
      this.logger.log(`sendDM: ${payload.sender} sent DM to ${payload.receiver}`);
      // 送信者と受信者のエンティティを取得
      const senderUser = await this.onlineUsersRepository.findOne({
        where: { name: payload.sender },
      });
      const recipientUser = await this.onlineUsersRepository.findOne({
        where: { name: payload.receiver },
      });

      // Userが存在しない場合は新規作成
      if (!senderUser) {
        await this.onlineUsersRepository.save({ name: payload.sender });
      }
      if (!recipientUser) {
        await this.onlineUsersRepository.save({ name: payload.receiver });
      }

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
      directMessage.senderId = payload.sender;
      directMessage.recipientId = payload.receiver;
      directMessage.message = payload.message;
      directMessage.timestamp = formatDate(new Date());
      await this.directMessageRepository.save(directMessage);
      this.logger.log(`Saved directMessage: ${JSON.stringify(directMessage)}`);

      const dmData: ChatMessage = {
        user: payload.sender,
        photo: senderUser?.icon || '',
        text: payload.message,
        timestamp: directMessage.timestamp,
      };

      // クライアントに送信
      this.server.to(payload.receiver).emit('updateDM', dmData);

      // 成功メッセージを返す
      return { success: true, message: 'DM sent successfully' };
    } catch (error) {
      // エラーハンドリング
      console.error('Error sending DM:', error);
      return { success: false, message: 'Failed to send DM' };
    }
  }
}

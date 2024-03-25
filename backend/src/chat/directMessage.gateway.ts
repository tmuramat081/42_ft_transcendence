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
import { ChatLog } from './entities/chatLog.entity';
import { Room } from './entities/room.entity';
import { User } from '../users/entities/user.entity';
import { DmLog } from './entities/dmLog.entity';
import { OnlineUsers } from './entities/onlineUsers.entity';
import { formatDate } from './tools';

interface UserInfo {
  ID: number;
  name: string;
  icon: string;
}

interface DirectMessage {
  sender: string;
  recipient: string;
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

    @InjectRepository(DmLog)
    private dmLogRepository: Repository<DmLog>,

    @InjectRepository(OnlineUsers)
    private onlineUsersRepository: Repository<OnlineUsers>,
  ) {}

  @SubscribeMessage('getCurrentUser')
  async handleGetCurrentUser(@ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`getCurrentUser`);
      // データベースからcurrentUserを取得
      const currentUser = await this.onlineUsersRepository.findOne({ where: { me: true } });
      if (currentUser) {
        this.logger.log(`currentUser found: ${JSON.stringify(currentUser)}`);
        // currentUserをUserInfoに変換
        const userInfo: UserInfo = {
          ID: currentUser.id,
          name: currentUser.name,
          icon: currentUser.icon,
        };
        this.server.to(socket.id).emit('currentUser', userInfo);
      } else {
        this.logger.error('No current user found');
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  // データベースからrecipientを取得
  @SubscribeMessage('getRecipient')
  async handleGetRecipient(@MessageBody() recipient: string, @ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`getRecipient: ${recipient}`);
      const recipientUser = await this.onlineUsersRepository.findOne({
        where: { name: recipient },
      });
      if (recipientUser) {
        this.logger.log(`Recipient found: ${JSON.stringify(recipientUser)}`);
        // recipientUserをUserInfoに変換
        const recipient: UserInfo = {
          ID: recipientUser.id,
          name: recipientUser.name,
          icon: recipientUser.icon,
        };
        this.server.to(socket.id).emit('recipient', recipient);
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
    } catch (error) {
      this.logger.error(`Error starting DM: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('getDMLogs')
  async handleGetDMLogs(
    @MessageBody() payload: { sender: UserInfo; receiver: UserInfo },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (!payload.sender || !payload.receiver) {
        this.logger.error('Invalid DM data:', payload);
        return;
      }
      this.logger.log(
        `getDMLogs: ${payload.sender.name} requested DM logs with ${payload.receiver.name}`,
      );

      // DMログを取得
      const dmLogs = await this.dmLogRepository.find({
        where: [
          { senderName: payload.sender.name, recipientName: payload.receiver.name },
          { senderName: payload.receiver.name, recipientName: payload.sender.name },
        ],
        order: { timestamp: 'ASC' },
      });
      this.logger.log(`dmLogs: ${JSON.stringify(dmLogs)}`);

      // dmLongsをdirectMessage[]に変換
      const directMessages: DirectMessage[] = dmLogs.map((dmLog) => {
        return {
          sender: dmLog.senderName,
          recipient: dmLog.recipientName,
          text: dmLog.message,
          timestamp: dmLog.timestamp,
        };
      });

      this.server.to(socket.id).emit('dmLogs', directMessages);
    } catch (error) {
      this.logger.error('Error getting DM logs:', error);
      throw error;
    }
  }

  @SubscribeMessage('sendDM')
  async handleSendDM(
    @MessageBody() payload: { sender: UserInfo; receiver: UserInfo; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (!payload.sender || !payload.receiver || !payload.message) {
        console.error('Invalid DM data:', payload);
        return { success: false, message: 'Invalid DM data' };
      }
      this.logger.log(
        `sendDM: ${payload.sender.name} sent DM to ${payload.receiver.name}: ${payload.message}`,
      );

      // DirectMessageを保存
      const dmLog = new DmLog();
      dmLog.senderName = payload.sender.name;
      dmLog.recipientName = payload.receiver.name;
      dmLog.message = payload.message;
      dmLog.timestamp = formatDate(new Date());
      await this.dmLogRepository.save(dmLog);
      this.logger.log(`Saved dmLog: ${JSON.stringify(dmLog)}`);

      // DMログを取得
      const dmLogs = await this.dmLogRepository.find({
        where: [
          { senderName: payload.sender.name, recipientName: payload.receiver.name },
          { senderName: payload.receiver.name, recipientName: payload.sender.name },
        ],
        order: { timestamp: 'ASC' },
      });
      this.logger.log(`dmLogs: ${JSON.stringify(dmLogs)}`);

      // dmLongsをdirectMessage[]に変換
      const directMessages: DirectMessage[] = dmLogs.map((dmLog) => {
        return {
          sender: dmLog.senderName,
          recipient: dmLog.recipientName,
          text: dmLog.message,
          timestamp: dmLog.timestamp,
        };
      });

      this.server.to(socket.id).emit('dmLogs', directMessages);
    } catch (error) {
      this.logger.error('Error sending DM logs:', error);
      throw error;
    }
  }
}

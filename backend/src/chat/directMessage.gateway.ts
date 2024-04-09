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
import { UserInfo, UserData, DirectMessage, formatDate } from './tools';

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
  async handle(@ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`getCurrentUser`);
      // データベースからcurrentUserを取得
      const currentUser = await this.onlineUsersRepository.findOne({ where: { me: true } });
      if (currentUser) {
        this.logger.log(`currentUser found: ${JSON.stringify(currentUser)}`);
        // currentUserをUserInfoに変換
        const userInfo: UserInfo = {
          userId: currentUser.id,
          userName: currentUser.name,
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
          userId: recipientUser.id,
          userName: recipientUser.name,
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

  // userRepositoryからユーザー情報を取得
  @SubscribeMessage('getUserInfo')
  async handleGetUserInfo(@MessageBody() userName: string, @ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`getUserInfo: ${userName}`);
      const user = await this.userRepository.findOne({ where: { userName: userName } });
      if (user) {
        this.logger.log(`User found: ${JSON.stringify(user)}`);
        // userをUserDataに変換
        const userInfo: UserData = {
          user: {
            userId: user.userId,
            userName: user.userName,
            icon: user.icon,
          },
          email: user.email,
          createdAt: user.createdAt,
          name42: user.name42,
        };
        this.server.to(socket.id).emit('userInfo', userInfo);
      } else {
        this.logger.error('No user found');
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
      this.logger.log(
        `startDM: ${payload.sender.userName} started DM with ${payload.receiver.userName}`,
      );
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
        `getDMLogs: ${payload.sender.userName} requested DM logs with ${payload.receiver.userName}`,
      );

      // DMログを取得
      const dmLogs = await this.dmLogRepository.find({
        where: [
          { senderName: payload.sender.userName, recipientName: payload.receiver.userName },
          { senderName: payload.receiver.userName, recipientName: payload.sender.userName },
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
        `sendDM: ${payload.sender.userName} sent DM to ${payload.receiver.userName}: ${payload.message}`,
      );

      // DirectMessageを保存
      const dmLog = new DmLog();
      dmLog.senderName = payload.sender.userName;
      dmLog.recipientName = payload.receiver.userName;
      dmLog.message = payload.message;
      dmLog.timestamp = formatDate(new Date());
      await this.dmLogRepository.save(dmLog);
      this.logger.log(`Saved dmLog: ${JSON.stringify(dmLog)}`);

      // DMログを取得
      const dmLogs = await this.dmLogRepository.find({
        where: [
          { senderName: payload.sender.userName, recipientName: payload.receiver.userName },
          { senderName: payload.receiver.userName, recipientName: payload.sender.userName },
        ],
        order: { timestamp: 'ASC' },
      });
      this.logger.log(`dmLogs: ${JSON.stringify(dmLogs)}`);

      // dmLogsをdirectMessage[]に変換
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

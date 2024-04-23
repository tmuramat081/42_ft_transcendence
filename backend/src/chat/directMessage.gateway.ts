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
import { Repository, Not, In } from 'typeorm';
import { ChatLog } from './entities/chatLog.entity';
import { Room } from './entities/room.entity';
import { User } from '../users/entities/user.entity';
import { DmLog } from './entities/dmLog.entity';
import { OnlineUsers } from './entities/onlineUsers.entity';
import { UserBlock } from './entities/userBlock.entity';
import { BlockedUser } from './entities/blockedUser.entity';
import { DirectMessage, formatDate } from './tools';

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

    @InjectRepository(UserBlock)
    private userBlockRepository: Repository<UserBlock>,

    @InjectRepository(BlockedUser)
    private blockedUserRepository: Repository<BlockedUser>,
  ) {}

  @SubscribeMessage('getCurrentUser')
  async handle(@MessageBody() user: User, @ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`getCurrentUser`);
      // データベースからuser.userIdと同じユーザーを取得
      const currentUser = await this.userRepository.findOne({
        where: {
          userId: user.userId,
        },
      });
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
  async handleGetRecipient(@MessageBody() recipient: string, @ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`getRecipient: ${recipient}`);
      const recipientUser = await this.userRepository.findOne({
        where: { userName: recipient },
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

  @SubscribeMessage('getDMLogs')
  async handleGetDMLogs(
    @MessageBody() payload: { sender: User; receiver: User },
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

      // ブロックしたユーザーのリストを取得
      const blockedUsers = await this.userBlockRepository.find({
        where: { user: payload.sender },
        relations: ['blockedUsers'],
      });

      // ブロックしたユーザーのリストを作成
      const blockedUsernames = blockedUsers
        .map((userBlock) => userBlock.blockedUsers.map((bu) => bu.blockedUser))
        .flat();

      this.logger.log(`Blocked users: ${JSON.stringify(blockedUsernames)}`);

      // DMログを取得
      const dmLogs = await this.dmLogRepository.find({
        where: [
          {
            senderId: payload.sender.userId,
            recipientId: Not(In(blockedUsernames)),
            // recipientId: payload.receiver.userId,
          },
          {
            // senderId: payload.receiver.userId,
            senderId: Not(In(blockedUsernames)),
            recipientId: payload.sender.userId,
          },
        ],
      });
      this.logger.log(`dmLogs: ${JSON.stringify(dmLogs)}`);

      // dmLogsをdirectMessage[]に変換
      const directMessages: DirectMessage[] = dmLogs.map((dmLog) => {
        return {
          senderId: dmLog.senderId,
          recipientId: dmLog.recipientId,
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
    @MessageBody() payload: { sender: User; receiver: User; message: string },
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
      dmLog.senderId = payload.sender.userId;
      dmLog.recipientId = payload.receiver.userId;
      dmLog.message = payload.message;
      dmLog.timestamp = formatDate(new Date());
      await this.dmLogRepository.save(dmLog);
      this.logger.log(`Saved dmLog: ${JSON.stringify(dmLog)}`);

      // ブロックしたユーザーのリストを取得
      const blockedUsers = await this.userBlockRepository.find({
        where: { user: payload.sender },
        relations: ['blockedUsers'],
      });

      // ブロックしたユーザーのリストを作成
      const blockedUsernames = blockedUsers
        .map((userBlock) => userBlock.blockedUsers.map((bu) => bu.blockedUser))
        .flat();
      this.logger.log(`Blocked users: ${JSON.stringify(blockedUsernames)}`);

      // DMログを取得
      const dmLogs = await this.dmLogRepository.find({
        where: [
          {
            senderId: payload.sender.userId,
            recipientId: Not(In(blockedUsernames)),
            // recipientId: payload.receiver.userId,
          },
          {
            // senderId: payload.receiver.userId,
            senderId: Not(In(blockedUsernames)),
            recipientId: payload.sender.userId,
          },
        ],
      });
      this.logger.log(`dmLogs: ${JSON.stringify(dmLogs)}`);

      // dmLogsをdirectMessage[]に変換
      const directMessages: DirectMessage[] = dmLogs.map((dmLog) => {
        return {
          senderId: dmLog.senderId,
          recipientId: dmLog.recipientId,
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

  @SubscribeMessage('blockUser')
  async handleBlockUser(
    @MessageBody() payload: { sender: User; receiver: User },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (!payload.sender || !payload.receiver) {
        console.error('Invalid DM data:', payload);
        return { success: false, message: 'Invalid User data' };
      }

      // userBlockとblockedUserエンティティを作成し、関係を設定する
      const userBlock = new UserBlock();
      userBlock.user = payload.sender;
      // await this.userBlockRepository.save(userBlock);
      // console.log('UserBlock saved:', userBlock); // 追加

      const blockedUser = new BlockedUser();
      blockedUser.blockedUser = payload.receiver;
      blockedUser.userBlock = userBlock;
      // this.logger.log(`blockedby: ${JSON.stringify(blockedUser.blockedBy)}`);
      // await this.blockedUserRepository.save(blockedUser);
      // console.log('BlockedUser saved:', blockedUser); // 追加

      userBlock.blockedUsers = [blockedUser];
      await this.userBlockRepository.save(userBlock);
      await this.blockedUserRepository.save(blockedUser);
      console.log('UserBlock saved:', userBlock);
      console.log('BlockedUser saved:', blockedUser);

      this.logger.log(`${payload.sender.userName} blocked ${payload.receiver.userName}`);

      // ブロックしたユーザーのリストを取得
      const blockedUsers = await this.userBlockRepository.find({
        where: { user: payload.sender },
        relations: ['blockedUsers'],
      });

      // ブロックしたユーザーのリストを作成
      const blockedUsernames = blockedUsers
        .map((userBlock) => userBlock.blockedUsers.map((bu) => bu.blockedUser))
        .flat();
      this.logger.log(`Blocked users: ${JSON.stringify(blockedUsernames)}`);

      // 成功のレスポンスを返す
      return { success: true, message: 'User blocked successfully' };
    } catch (error) {
      this.logger.error('Error blocking user:', error);
      throw error;
    }
  }

  @SubscribeMessage('unblockUser')
  async handleUnblockUser(
    @MessageBody() payload: { sender: User; receiver: User },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (!payload.sender || !payload.receiver) {
        console.error('Invalid DM data:', payload);
        return { success: false, message: 'Invalid User data' };
      }
      // ブロックされたユーザーのエンティティを削除する
      await this.blockedUserRepository.delete({ blockedUser: payload.receiver });

      // ユーザーブロックエンティティを削除する
      await this.userBlockRepository.delete({ user: payload.sender });

      this.logger.log(`${payload.sender.userName} unblocked ${payload.receiver.userName}`);

      // 成功のレスポンスを返す
      return { success: true, message: 'User unblocked successfully' };
    } catch (error) {
      this.logger.error('Error unblocking user:', error);
      throw error;
    }
  }
}

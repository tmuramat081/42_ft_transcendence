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
        // // currentUserをUserInfoに変換
        // const userInfo: UserInfo = {
        //   userId: currentUser.userId,
        //   userName: currentUser.userName,
        //   icon: currentUser.icon,
        // };
        // this.server.to(socket.id).emit('currentUser', userInfo);
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
        // // recipientUserをUserInfoに変換
        // const recipient: UserInfo = {
        //   userId: recipientUser.userId,
        //   userName: recipientUser.userName,
        //   icon: recipientUser.icon,
        // };
        // this.server.to(socket.id).emit('recipient', recipient);
        this.server.to(socket.id).emit('recipient', recipientUser);
      } else {
        this.logger.error('No recipient found');
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  // // userRepositoryからユーザー情報を取得
  // @SubscribeMessage('getUserInfo')
  // async handleGetUserInfo(@MessageBody() userName: string, @ConnectedSocket() socket: Socket) {
  //   try {
  //     this.logger.log(`getUserInfo: ${userName}`);
  //     const user = await this.userRepository.findOne({ where: { userName: userName } });
  //     if (user) {
  //       this.logger.log(`User found: ${JSON.stringify(user)}`);
  //       // userをUserDataに変換
  //       const userInfo: UserData = {
  //         user: {
  //           userId: user.userId,
  //           userName: user.userName,
  //           icon: user.icon,
  //         },
  //         email: user.email,
  //         createdAt: formatDate(user.createdAt),
  //         name42: user.name42,
  //       };
  //       this.server.to(socket.id).emit('userInfo', userInfo);
  //     } else {
  //       this.logger.error('No user found');
  //     }
  //   } catch (error) {
  //     this.logger.error(error);
  //   }
  // }

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
        where: { userName: payload.sender.userName },
        relations: ['blockedUsers'],
      });

      // ブロックしたユーザーのリストを作成
      const blockedUsernames = blockedUsers
        .map((userBlock) => userBlock.blockedUsers.map((bu) => bu.userName))
        .flat();

      // DMログを取得
      const dmLogs = await this.dmLogRepository.find({
        where: [
          {
            sender: payload.sender,
            recipient: payload.receiver,
          },
          {
            recipient: payload.sender,
            // ブロックしたユーザーとのDMを除外
            sender: Not(In(blockedUsernames)),
          },
        ],
        order: { timestamp: 'ASC' },
      });
      this.logger.log(`dmLogs: ${JSON.stringify(dmLogs)}`);

      // dmLogsをdirectMessage[]に変換
      const directMessages: DirectMessage[] = dmLogs.map((dmLog) => {
        return {
          sender: dmLog.sender,
          recipient: dmLog.recipient,
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
      dmLog.sender = payload.sender;
      dmLog.recipient = payload.receiver;
      dmLog.message = payload.message;
      dmLog.timestamp = formatDate(new Date());
      await this.dmLogRepository.save(dmLog);
      this.logger.log(`Saved dmLog: ${JSON.stringify(dmLog)}`);

      // DMログを取得
      const dmLogs = await this.dmLogRepository.find({
        where: [
          {
            recipient: payload.receiver,
            // 送信者がブロックされている場合は除外する
            sender: Not(
              In(
                await this.userBlockRepository
                  // ブロックされたユーザーのリストを取得
                  .find({ where: { userName: payload.receiver.userName } })
                  .then((userBlock) => userBlock.map((ub) => ub.userName)),
              ),
            ),
          },
          {
            sender: payload.receiver,
            recipient: payload.sender,
          },
        ],
        order: { timestamp: 'ASC' },
      });
      this.logger.log(`dmLogs: ${JSON.stringify(dmLogs)}`);

      // dmLogsをdirectMessage[]に変換
      const directMessages: DirectMessage[] = dmLogs.map((dmLog) => {
        return {
          sender: dmLog.sender,
          recipient: dmLog.recipient,
          text: dmLog.message,
          timestamp: dmLog.timestamp,
        };
      });
      // senderにdmLogsを送信
      this.server.to(socket.id).emit('dmLogs', directMessages);
      // receiverにdmLogsを送信
      this.server.to(String(payload.receiver.userId)).emit('dmLogs', directMessages);
      // receiverに通知
      this.server.to(String(payload.receiver.userId)).emit('newDM', payload.sender.userName);
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
      // ブロックされたユーザーのエンティティを作成し、関係を設定する
      const blockedUser = new BlockedUser();
      blockedUser.userName = payload.receiver.userName;

      const userBlock = new UserBlock();
      userBlock.userName = payload.sender.userName;
      userBlock.blockedUsers = [blockedUser];

      // ユーザーブロックエンティティを保存する
      await this.userBlockRepository.save(userBlock);

      this.logger.log(`${payload.sender.userName} blocked ${payload.receiver.userName}`);

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
      await this.blockedUserRepository.delete({ userName: payload.receiver.userName });

      this.logger.log(`${payload.sender.userName} unblocked ${payload.receiver.userName}`);

      // 成功のレスポンスを返す
      return { success: true, message: 'User unblocked successfully' };
    } catch (error) {
      this.logger.error('Error unblocking user:', error);
      throw error;
    }
  }
}

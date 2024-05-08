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
import { get } from 'http';

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

  @SubscribeMessage('joinDMRoom')
  async handleJoinDMRoom(
    @MessageBody() payload: { sender: User; receiver: User },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      // 送信者と受信者のユーザーIDを取得
      const senderId = payload.sender.userId;
      const receiverId = payload.receiver.userId;

      // ログを出力
      this.logger.log(
        `${payload.sender.userName} joined DM room with ${payload.receiver.userName}`,
      );

      // 送信者と受信者の両方が同じルームに参加する
      socket.join(`DMRoom_${senderId}_${receiverId}`);
      socket.join(`DMRoom_${receiverId}_${senderId}`);

      // クライアントにルーム参加の確認を送信
      this.server.to(socket.id).emit('joinDMRoomConfirmation');
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SubscribeMessage('leaveDMRoom')
  async handleLeaveDMRoom(
    @MessageBody() payload: { sender: User; receiver: User },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      // 送信者と受信者のユーザーIDを取得
      const senderId = payload.sender.userId;
      const receiverId = payload.receiver.userId;

      // ログを出力
      this.logger.log(`${payload.sender.userName} left DM room with ${payload.receiver.userName}`);

      // 送信者と受信者の両方が同じルームから退出する
      socket.leave(`DMRoom_${senderId}_${receiverId}`);
      socket.leave(`DMRoom_${receiverId}_${senderId}`);

      // クライアントにルーム退出の確認を送信
      this.server.to(socket.id).emit('leaveDMRoomConfirmation');
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SubscribeMessage('getBlockedUsers')
  async handleGetBlockedUsers(@MessageBody() sender: User, @ConnectedSocket() socket: Socket) {
    try {
      // ブロックしたユーザーのリストを取得
      const blockedUsers = await this.userBlockRepository.find({
        where: { user: sender },
        relations: ['blockedUsers'],
      });
      this.logger.log(`blockedUsers: ${JSON.stringify(blockedUsers)}`);

      // ブロックしたユーザーのIDリストを取得
      const blockedUserIds = blockedUsers.flatMap((userBlock) =>
        userBlock.blockedUsers.map((blockedUser) => blockedUser.blockedUser.userId),
      );
      this.logger.log(`blockedUserIds: ${JSON.stringify(blockedUserIds)}`);
      // ブロックしたユーザーのユーザー名リストを取得
      const blockedUserNames = await this.userRepository.find({
        where: { userId: In(blockedUserIds) },
      });

      this.logger.log(
        `getBlockedUsers: ${sender.userName} blocked users ${JSON.stringify(blockedUserNames)}`,
      );

      // クライアントにブロックしたユーザーのリストを送信
      this.server.to(socket.id).emit('blockedUsers', blockedUserIds);
    } catch (error) {
      this.logger.error('Error getting blocked users:', error);
      throw error;
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

      // DMログを取得
      const dmLogs = await this.dmLogRepository.find({
        where: [
          {
            senderId: payload.sender.userId,
            recipientId: payload.receiver.userId,
          },
          {
            senderId: payload.receiver.userId,
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

      // senderとreceiverのroomにDMログを送信
      this.server
        .to(`DMRoom_${payload.sender.userId}_${payload.receiver.userId}`)
        .emit('dmLogs', directMessages);
      this.server
        .to(`DMRoom_${payload.receiver.userId}_${payload.sender.userId}`)
        .emit('dmLogs', directMessages);
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

      // DMログを取得
      const dmLogs = await this.dmLogRepository.find({
        where: [
          {
            senderId: payload.sender.userId,
            recipientId: payload.receiver.userId,
          },
          {
            senderId: payload.receiver.userId,
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

      // receiverがブロックしてるユーザーのリストを取得
      const blockedUsers = await this.userBlockRepository.find({
        where: { user: payload.receiver },
        relations: ['blockedUsers'],
      });

      // ブロックしたユーザーのIDリストを取得
      const blockedUserIds = blockedUsers.flatMap((userBlock) =>
        userBlock.blockedUsers.map((blockedUser) => blockedUser.id),
      );

      // ブロックしたユーザーのユーザー名リストを取得
      const blockedUserNames = await this.userRepository.find({
        where: { userId: In(blockedUserIds) },
      });

      this.logger.log(
        `getBlockedUsers: ${payload.receiver.userName} blocked users ${JSON.stringify(
          blockedUserNames,
        )}`,
      );

      // senderにDMログを送信
      this.server
        .to(`DMRoom_${payload.sender.userId}_${payload.receiver.userId}`)
        .emit('dmLogs', directMessages);
      // senderがblockedUserIdsに含まれていない場合のみreceiverにも送信
      if (!blockedUserIds.includes(payload.sender.userId)) {
        this.server
          .to(`DMRoom_${payload.receiver.userId}_${payload.sender.userId}`)
          .emit('dmLogs', directMessages);
      }
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
        console.error('Invalid user data:', payload);
        return { success: false, message: 'Invalid User data' };
      }

      // senderのUserBlockを取得または作成
      let userBlock = await this.userBlockRepository.findOne({
        where: { user: payload.sender },
        relations: ['blockedUsers'],
      });

      if (!userBlock) {
        userBlock = new UserBlock();
        userBlock.user = payload.sender;
        userBlock.blockedUsers = [];
      }

      this.logger.log('UserBlock found:', userBlock.user);

      // receiverのBlockedUserを取得または作成
      let blockedUser = await this.blockedUserRepository.findOne({
        where: { blockedUser: payload.receiver },
        relations: ['userBlocks'],
      });

      if (!blockedUser) {
        blockedUser = new BlockedUser();
        blockedUser.blockedUser = payload.receiver;
        blockedUser.userBlocks = [];
      }

      this.logger.log('BlockedUser found:', blockedUser.blockedUser);

      const existingBlockedUser = userBlock.blockedUsers.find((bu) => bu.id === blockedUser.id);
      if (!existingBlockedUser) {
        userBlock.blockedUsers.push(blockedUser);
      }

      const existingUserBlock = blockedUser.userBlocks.find((ub) => ub.id === userBlock.id);
      if (!existingUserBlock) {
        blockedUser.userBlocks.push(userBlock);
      }

      // userBlock の更新
      userBlock.blockedUsers = userBlock.blockedUsers.map((blockedUser) => ({
        ...blockedUser,
        user: userBlock,
      }));
      await this.userBlockRepository.save(userBlock);

      // blockedUser の更新
      blockedUser.userBlocks = blockedUser.userBlocks.map((userBlock) => ({
        ...userBlock,
        blockedUser: blockedUser,
      }));
      await this.blockedUserRepository.save(blockedUser);

      // blockedUsersにreceiverを追加
      // if (userBlock.blockedUsers) {
      //   const existingBlockedUser = userBlock.blockedUsers.find((bu) => bu.id === blockedUser.id);
      //   if (!existingBlockedUser) {
      //     userBlock.blockedUsers.push(blockedUser);
      //   }
      // } else {
      //   userBlock.blockedUsers = [blockedUser];
      // }

      // blockedUserのuserBlockにsenderを追加
      // if (blockedUser.userBlocks) {
      //   const existingUserBlock = blockedUser.userBlocks.find((ub) => ub.id === userBlock.id);
      //   if (!existingUserBlock) {
      //     blockedUser.userBlocks.push(userBlock);
      //   }
      // } else {
      //   blockedUser.userBlocks = [userBlock];
      // }

      // // userBlock の更新
      // await this.userBlockRepository
      //   .createQueryBuilder()
      //   .relation(UserBlock, 'blockedUsers')
      //   .of(userBlock)
      //   .addAndRemove(userBlock.blockedUsers, []);

      // // blockedUser の更新
      // await this.blockedUserRepository
      //   .createQueryBuilder()
      //   .relation(BlockedUser, 'userBlocks')
      //   .of(blockedUser)
      //   .addAndRemove(blockedUser.userBlocks, []);

      // // userBlock の更新
      // await this.userBlockRepository
      //   .createQueryBuilder()
      //   .update(UserBlock)
      //   .set({ blockedUsers: userBlock.blockedUsers })
      //   .where('id = :id', { id: userBlock.id })
      //   .execute();

      // // blockedUser の更新
      // await this.blockedUserRepository
      //   .createQueryBuilder()
      //   .update(BlockedUser)
      //   .set({ userBlocks: blockedUser.userBlocks })
      //   .where('id = :id', { id: blockedUser.id })
      //   .execute();

      // // userBlock の更新
      // await this.userBlockRepository
      //   .createQueryBuilder()
      //   .update(UserBlock)
      //   .set({ blockedUsers: () => `ARRAY_APPEND(blockedUsers, ${blockedUser.id})` })
      //   .where('id = :id', { id: userBlock.id })
      //   .execute();

      // // blockedUser の更新
      // await this.blockedUserRepository
      //   .createQueryBuilder()
      //   .update(BlockedUser)
      //   .set({ userBlocks: () => `ARRAY_APPEND(userBlocks, ${userBlock.id})` })
      //   .where('id = :id', { id: blockedUser.id })
      //   .execute();

      // await this.userBlockRepository.save(userBlock);
      // await this.blockedUserRepository.save(blockedUser);

      this.logger.log(`${payload.sender.userName} blocked ${payload.receiver.userName}`);
      this.logger.log('UserBlock saved:', {
        id: userBlock.id,
        user: userBlock.user,
        blockedUsers: userBlock.blockedUsers,
      });
      this.logger.log('BlockedUser saved:', {
        id: blockedUser.id,
        blockedUser: blockedUser.blockedUser,
        userBlock: blockedUser.userBlocks,
      });

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
        console.error('Invalid user data:', payload);
        return { success: false, message: 'Invalid User data' };
      }

      // ブロックしたユーザーのリストを取得
      const blockedUsers = await this.userBlockRepository.find({
        where: { user: payload.sender },
        relations: ['blockedUsers'],
      });

      // ブロックしたユーザーからreceiver.userIdを削除
      const blockedUser = blockedUsers.find((userBlock) =>
        userBlock.blockedUsers.some(
          (blockedUser) => blockedUser.blockedUser.userId === payload.receiver.userId,
        ),
      );

      if (!blockedUser) {
        this.logger.error(
          `${payload.sender.userName} has not blocked ${payload.receiver.userName}`,
        );
        return { success: false, message: 'User not blocked' };
      }

      // ブロックを解除するためにブロックリストから削除
      blockedUser.blockedUsers = blockedUser.blockedUsers.filter(
        (blockedUser) => blockedUser.blockedUser.userId !== payload.receiver.userId,
      );
      await this.userBlockRepository.save(blockedUser);

      this.logger.log(`${payload.sender.userName} unblocked ${payload.receiver.userName}`);

      // 成功のレスポンスを返す
      return { success: true, message: 'User unblocked successfully' };
    } catch (error) {
      this.logger.error('Error unblocking user:', error);
      throw error;
    }
  }
}

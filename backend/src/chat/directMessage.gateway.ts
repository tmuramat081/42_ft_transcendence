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
      });

      this.logger.log(`Blocked users: ${JSON.stringify(blockedUsers)}`);

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

      // ブロックしたユーザーのリストを取得
      const blockedUsers = await this.userBlockRepository.find({
        where: { user: payload.sender },
      });

      this.logger.log(`Blocked users: ${JSON.stringify(blockedUsers)}`);

      // DMログを取得
      const dmLogs = await this.dmLogRepository.find({
        where: [
          {
            senderId: payload.sender.userId,
            recipientId: Not(In(blockedUsers)),
          },
          {
            senderId: Not(In(blockedUsers)),
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

      // // senderとreceiverにDMログを送信
      // this.server.to(socket.id).emit('dmLogs', directMessages);
      // // receiverにDMログを送信
      // this.server.to(payload.receiver.userName).emit('dmLogs', directMessages);
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

      // senderのUserBlockを取得または作成
      let userBlock = await this.userBlockRepository.findOne({
        where: { user: payload.sender },
      });

      if (!userBlock) {
        userBlock = new UserBlock();
        userBlock.user = payload.sender;
        userBlock.blockedUsers = [payload.receiver.userId];
      } else {
        // ユーザーブロックがすでに存在する場合、blockedUsersにreceiverを追加
        if (!userBlock.blockedUsers.includes(payload.receiver.userId)) {
          userBlock.blockedUsers.push(payload.receiver.userId);
        }
      }
      await this.userBlockRepository.save(userBlock);
      this.logger.log(`UserBlock saved: ${JSON.stringify(userBlock)}`);
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

      // ブロックしたユーザーのリストを取得
      const blockedUsers = await this.userBlockRepository.find({
        where: { user: payload.sender },
      });

      // ブロックしたユーザーからreceiver.userIdを削除
      const blockedUser = blockedUsers.find((userBlock) =>
        userBlock.blockedUsers.includes(payload.receiver.userId),
      );

      if (!blockedUser) {
        this.logger.error(
          `${payload.sender.userName} has not blocked ${payload.receiver.userName}`,
        );
        return { success: false, message: 'User not blocked' };
      }

      const index = blockedUser.blockedUsers.indexOf(payload.receiver.userId);
      blockedUser.blockedUsers.splice(index, 1);
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

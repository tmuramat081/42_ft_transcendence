/* eslint-disable */
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
// import { UsersService } from '../users/users.service';
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
import { UserInfo, ChatMessage, formatDate, convertDurationToMs } from './tools';
import { format } from 'path';

@WebSocketGateway({ cors: { origin: '*' } })
export class RoomGateway {
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

    // private readonly usersService: UsersService,
  ) {}

  @SubscribeMessage('getUserCurrent')
  async handle(@MessageBody() user: User, @ConnectedSocket() socket: Socket) {
    try {
      // this.logger.log(`getUserCurrent: ${user.userName}`);
      // データベースからuser.userIdと同じユーザーを取得
      const userData = await this.userRepository.findOne({
        where: {
          userId: user.userId,
        },
      });
      if (User) {
        this.server.to(socket.id).emit('user', userData);
      } else {
        this.logger.error('No user found');
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SubscribeMessage('getAllUsers')
  async handleGetAllUsers(@MessageBody() user: User, @ConnectedSocket() socket: Socket) {
    try {
      // this.logger.log(`getAllUsers: ${user.userName}`);
      // データベースから全ユーザーを取得
      const allUsers = await this.userRepository.find();
      if (allUsers) {
        // 自分自身を除いてクライアントに送信
        const users = allUsers.filter((u) => u.userId !== user.userId);
        this.server.to(socket.id).emit('allUsers', users);
      } else {
        this.logger.error('No users found');
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SubscribeMessage('getRoomInfo')
  async handleGetRoomInfo(
    @MessageBody() data: { user: User; params: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      // this.logger.log(`getRoomInfo: ${data.user.userName} requested info for ${data.params}`);
      // データベースからroomNameと同じ部屋を取得
      const room = await this.roomRepository.findOne({
        where: {
          roomName: data.params,
        },
      });
      if (room) {
        this.logger.log(`Room found: ${room.roomName}, ${room.id}`);
        // ブロックされていたらエラーを返す
        if (room.roomBlocked && room.roomBlocked.includes(data.user.userId)) {
          this.logger.error('User is blocked');
          socket.emit('roomError', 'Room is protected.');
          return;
        }
        this.server.to(socket.id).emit('roomId', room.id);
        this.server.to(socket.id).emit('roomType', room.roomType);
        // OwnerのUser情報を取得してクライアントに送信
        const owner = await this.userRepository.findOne({
          where: {
            userId: room.roomOwner,
          },
        });
        this.server.to(socket.id).emit('roomOwner', owner);
        // AdminのUser情報を取得してクライアントに送信
        const admin = await this.userRepository.findOne({
          where: {
            userId: room.roomAdmin,
          },
        });
        this.server.to(socket.id).emit('roomAdmin', admin);
        // roomParticipantsをUserInfoに変換
        const roomParticipants: UserInfo[] = room.roomParticipants.map((participant) => {
          return {
            userId: participant.id,
            userName: participant.name,
            icon: participant.icon,
          };
        });
        this.server.to(socket.id).emit('roomParticipants', roomParticipants);
        // roomBlockedからUser情報を取得してUserInfoに変換
        if (room.roomBlocked) {
          const blockedUsers: UserInfo[] = [];
          for (const blocked of room.roomBlocked) {
            const blockedUser = await this.userRepository.findOne({
              where: {
                userId: blocked,
              },
            });
            if (blockedUser) {
              blockedUsers.push({
                userId: blockedUser.userId,
                userName: blockedUser.userName,
                icon: blockedUser.icon,
              });
            }
          }
          this.logger.log(`Blocked users: ${JSON.stringify(blockedUsers)}`);
          this.server.to(socket.id).emit('roomBlocked', blockedUsers);
        }

        // roomMutedのmutedUntilが現在時刻を過ぎている場合は削除
        if (room.roomMuted) {
          const formatNow = formatDate(new Date());
          const mutedUsers = room.roomMuted.filter((muted) => {
            return formatNow < muted.mutedUntil;
          });
          room.roomMuted = mutedUsers;
          await this.roomRepository.save(room);
        }
        // { user: UserInfo; mutedUntil: string }[]に変換
        const mutedUsers: { user: UserInfo; mutedUntil: string }[] = [];
        for (const muted of room.roomMuted) {
          const mutedUser = await this.userRepository.findOne({
            where: {
              userId: muted.id,
            },
          });
          if (mutedUser) {
            mutedUsers.push({
              user: {
                userId: mutedUser.userId,
                userName: mutedUser.userName,
                icon: mutedUser.icon,
              },
              mutedUntil: muted.mutedUntil,
            });
          }
        }
        this.logger.log(`mutedUsers: ${JSON.stringify(mutedUsers)}`);
        this.server.to(socket.id).emit('roomMuted', mutedUsers);
      } else {
        this.logger.error('No room found');
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() join: { roomID: number; room: string; user: User },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(`joinRoom: ${join.user.userName} joined ${join.room}`);
      // 既に部屋に入っている場合は退出
      const rooms = Array.from(socket.rooms);
      if (rooms.length > 1) socket.leave(rooms[1]);
      // データベースから部屋を取得
      const room = await this.roomRepository.findOne({ where: { id: join.roomID } });
      if (!room) {
        this.logger.error(`Room ${join.room} not found in the database.`);
        socket.emit('roomError', 'Room not found.');
        return;
      }
      if (!room.roomParticipants) {
        room.roomParticipants = [];
      }
      // 参加者が100人を超える場合はエラーを返す
      if (room.roomParticipants.length >= 100) {
        this.logger.error('Room is full');
        socket.emit('roomError', 'Room is full.');
        return;
      }
      // ブロックリストに含まれている場合はエラーを返す
      if (room.roomBlocked && room.roomBlocked.includes(join.user.userId)) {
        this.logger.error('User is blocked');
        socket.emit('roomError', 'Room is protected.');
        return;
      }

      // ユーザーが存在してないか確認
      const existingUser = room.roomParticipants.find(
        (participant) => participant.id === join.user.userId,
      );
      if (!existingUser) {
        // userRepositoryからユーザー情報を取得して追加
        const userData = await this.userRepository.findOne({
          where: { userId: join.user.userId },
        });
        if (!userData) {
          this.logger.error(`User ${join.user.userName} not found in the database.`);
          socket.emit('roomError', 'User not found.');
          return;
        }
        room.roomParticipants.push({
          id: userData.userId,
          name: userData.userName,
          icon: userData.icon,
        });
        await this.roomRepository.save(room);
      }
      // ソケットにルームに参加させる
      socket.join(join.room);
      // 参加者リストを取得してクライアントに送信
      const updatedRoom = await this.roomRepository.findOne({ where: { id: join.roomID } });
      if (updatedRoom) {
        // updatedRoom.roomParticipantsをUserInfoに変換
        const updatedRoomParticipants: UserInfo[] = updatedRoom.roomParticipants.map(
          (participant) => {
            return {
              userId: participant.id,
              userName: participant.name,
              icon: participant.icon,
            };
          },
        );
        this.server.to(join.room).emit('updatedRoomParticipants', updatedRoomParticipants);
      } else {
        this.logger.error(`Error getting updated room.`);
      }
      // チャットログを取得してクライアントに送信
      const chatLogs = await this.chatLogRepository.find({ where: { roomID: join.roomID } });
      if (chatLogs) {
        // chatLogsをchatmessage[]に変換
        const chatMessages: ChatMessage[] = chatLogs.map((log) => {
          return {
            user: log.sender,
            photo: log.icon,
            text: log.message,
            timestamp: log.timestamp,
          };
        });
        this.server.to(join.room).emit('chatLogs', chatMessages);
      } else {
        this.logger.error(`Error getting chat logs.`);
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.logger.error(`Error joining room: ${errorMessage}`);
      socket.emit('roomError', `Error joining room: ${errorMessage}`);
    }
  }

  @SubscribeMessage('verifyRoomPassword')
  async handleVerifyRoomPassword(
    @MessageBody() data: { roomID: number; roomName: string; password: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(`verifyRoomPassword: ${data.roomName} ${data.password}`);
      // データベースから部屋を取得
      const room = await this.roomRepository.findOne({ where: { id: data.roomID } });
      if (room) {
        // パスワードが一致するか確認
        if (room.roomPassword === data.password) {
          this.server.to(socket.id).emit('passwordVerified', true);
        } else {
          this.server.to(socket.id).emit('passwordVerified', false);
        }
      } else {
        this.logger.error(`Room ${data.roomName} not found in the database.`);
      }
    } catch (error) {
      this.logger.error(`Error verifying room password: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('requestPermission')
  async handleRequestPermission(
    @MessageBody() data: { roomID: number; room: string; user: User },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(`requestPermission: ${data.user.userName} requested permission`);
      // roomIDでデータベースから部屋を取得
      const room = await this.roomRepository.findOne({ where: { id: data.roomID } });
      if (room) {
        this.server.to(data.room).emit('permissionRequested', data.user);
      } else {
        this.logger.error(`Room ${data.room} not found in the database.`);
      }
    } catch (error) {
      this.logger.error(`Error requesting permission: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('permissionGranted')
  async handlePermissionGranted(
    @MessageBody() data: { roomID: number; room: string; user: User; admin: User },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(
        `permissionGranted: ${data.admin.userName} granted permission to ${data.user.userName} in ${data.room}`,
      );
      // データベースから部屋を取得
      const room = await this.roomRepository.findOne({ where: { id: data.roomID } });
      if (room) {
        // ブロックリストをチェック
        if (room.roomBlocked && room.roomBlocked.includes(data.user.userId)) {
          this.logger.error(`User ${data.user.userName} is blocked in ${data.room}`);
          return;
        }
        this.server.to(data.room).emit('permissionGranted', data.user);
      } else {
        this.logger.error(`Room ${data.room} not found in the database.`);
      }
    } catch (error) {
      this.logger.error(`Error granting permission: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('permissionDenied')
  async handlePermissionDenied(
    @MessageBody() data: { roomID: number; room: string; user: User; admin: User },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(
        `permissionDenied: ${data.admin.userName} denied permission to ${data.user.userName} in ${data.room}`,
      );
      // データベースから部屋を取得
      const room = await this.roomRepository.findOne({ where: { id: data.roomID } });
      if (room) {
        this.server.to(data.room).emit('permissionDenied', data.user);
      } else {
        this.logger.error(`Room ${data.room} not found in the database.`);
      }
    } catch (error) {
      this.logger.error(`Error denying permission: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('talk')
  async handleMessage(
    @MessageBody()
    data: { roomID: number; selectedRoom: string; currentUser: User; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (!data.selectedRoom || !data.currentUser || !data.message) {
        this.logger.error('Invalid chat message data:', data);
        this.logger.log(
          `talk: ${data.currentUser.userName} said ${data.message} in ${data.selectedRoom}`,
        );
        return;
      }
      this.logger.log(
        `${data.selectedRoom} received ${data.message} from ${data.currentUser.userName}`,
      );

      // ユーザーがミュートされているか確認
      const room = await this.roomRepository.findOne({ where: { id: data.roomID } });
      const mutedUser = room.roomMuted.find(
        (muted) => muted.id === data.currentUser.userId && new Date(muted.mutedUntil) > new Date(),
      );

      if (mutedUser) {
        this.logger.error(
          `User ${data.currentUser.userName} is muted until ${mutedUser.mutedUntil} in ${data.selectedRoom}`,
        );
        return;
      }

      // チャットログを保存
      const chatLog = new ChatLog();
      chatLog.roomID = data.roomID;
      chatLog.roomName = data.selectedRoom;
      chatLog.sender = data.currentUser.userName;
      chatLog.icon = data.currentUser.icon;
      chatLog.message = data.message;
      chatLog.timestamp = formatDate(new Date());
      await this.chatLogRepository.save(chatLog);
      this.logger.log(`Saved chatLog: ${JSON.stringify(chatLog)}`);

      // チャットログを取得
      const chatLogs = await this.chatLogRepository.find({
        where: { roomID: data.roomID },
      });
      // this.logger.log(`Chat logs: ${JSON.stringify(chatLogs)}`);
      // chatLogsをchatmessage[]に変換
      const chatMessages: ChatMessage[] = chatLogs.map((log) => {
        return {
          user: log.sender,
          photo: log.icon,
          text: log.message,
          timestamp: log.timestamp,
        };
      });
      this.server.to(data.selectedRoom).emit('chatLogs', chatMessages);
    } catch (error) {
      this.logger.error(`Error handling message: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() leave: { roomID: number; room: string; user: User },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(`leaveRoom: ${leave.user.userName} left ${leave.room}`);
      // データベースから部屋を取得
      const room = await this.roomRepository.findOne({ where: { id: leave.roomID } });

      // 参加者リストを更新
      if (room) {
        if (room.roomParticipants) {
          room.roomParticipants = room.roomParticipants.filter(
            (participant) => participant.name !== leave.user.userName,
          );
          await this.roomRepository.save(room);
        }
      } else {
        this.logger.error(`Room ${leave.room} not found in the database.`);
      }

      // 更新された参加者リストを取得してクライアントに送信
      const updatedRoom = await this.roomRepository.findOne({ where: { id: leave.roomID } });
      if (updatedRoom) {
        // updatedRoom.roomParticipantsをUserInfoに変換
        const updatedRoomParticipants: UserInfo[] = updatedRoom.roomParticipants.map(
          (participant) => {
            return {
              userId: participant.id,
              userName: participant.name,
              icon: participant.icon,
            };
          },
        );
        this.server.to(leave.room).emit('updatedRoomParticipants', updatedRoomParticipants);
      } else {
        this.logger.error(`Error getting updated room.`);
      }

      // ソケットからルームを退出させる
      const rooms = Object.keys(socket.rooms);
      if (rooms.includes(leave.room)) {
        socket.leave(leave.room);
      }
    } catch (error) {
      this.logger.error(`Error leaving room: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('deleteRoom')
  async handleDeleteRoom(@MessageBody() delet: { roomID: number; room: string; user: User }) {
    try {
      this.logger.log(`${delet.user.userName} deleted Room: ${delet.room}`);

      // データベースから指定のルームを削除
      const deletedRoom = await this.roomRepository.findOne({
        where: { id: delet.roomID },
      });
      if (deletedRoom) {
        await this.roomRepository.remove(deletedRoom);
        this.logger.log(`Room ${delet.room} has been deleted from the database.`);
      } else {
        this.logger.error(`Room ${delet.room} not found in the database.`);
      }

      // 新しい roomList を取得してコンソールに出力
      const updatedRoomList = await this.roomRepository.find();

      this.server.emit('roomList', updatedRoomList);
    } catch (error) {
      this.logger.error(`Error deleting room: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('roomSettings')
  async handleRoomSettings(
    @MessageBody()
    settings: {
      roomID: number;
      selectedRoom: string;
      roomSettings: {
        roomName: string;
        roomType: string;
        roomPassword: string;
        roomAdmin: number;
        roomBlocked: number;
        roomUnblocked: number;
        roomMuted: number;
        roomUnmuted: number;
        muteDuration: string;
      };
    },
  ) {
    try {
      this.logger.log(`Room settings: ${JSON.stringify(settings)}`);

      // データベースから部屋を取得
      const room = await this.roomRepository.findOne({
        where: { id: settings.roomID },
      });
      this.logger.log(`Room: ${JSON.stringify(room)}`);

      // ルームの設定を更新
      if (room) {
        if (settings.roomSettings.roomName) {
          room.roomName = settings.roomSettings.roomName;
        }
        if (settings.roomSettings.roomType) {
          room.roomType = settings.roomSettings.roomType;
        }
        if (settings.roomSettings.roomPassword) {
          room.roomPassword = settings.roomSettings.roomPassword;
        }
        if (settings.roomSettings.roomAdmin) {
          room.roomAdmin = settings.roomSettings.roomAdmin;
        }
        if (settings.roomSettings.roomBlocked) {
          if (!room.roomBlocked) {
            room.roomBlocked = [];
          } else if (room.roomBlocked.includes(settings.roomSettings.roomBlocked)) {
            room.roomBlocked = room.roomBlocked.filter(
              (blocked) => blocked !== settings.roomSettings.roomBlocked,
            );
          }
          room.roomBlocked.push(settings.roomSettings.roomBlocked);
          // ブロックされたユーザーをParticipantsから削除
          if (room.roomParticipants) {
            room.roomParticipants = room.roomParticipants.filter(
              (participant) => participant.id !== settings.roomSettings.roomBlocked,
            );
          }
          // await this.roomRepository.save(room);
          // const updatedRoom = await this.roomRepository.findOne({
          //   where: { id: settings.roomID },
          // });
          // if (updatedRoom) {
          //   // updatedRoom.roomParticipantsをUserInfoに変換
          //   const updatedRoomParticipants: UserInfo[] = updatedRoom.roomParticipants.map(
          //     (participant) => {
          //       return {
          //         userId: participant.id,
          //         userName: participant.name,
          //         icon: participant.icon,
          //       };
          //     },
          //   );
          //   this.server
          //     .to(settings.selectedRoom)
          //     .emit('updatedRoomParticipants', updatedRoomParticipants);
          // } else {
          //   this.logger.error(`Error getting updated room.`);
          // }
        }
        if (settings.roomSettings.roomUnblocked) {
          if (room.roomBlocked) {
            room.roomBlocked = room.roomBlocked.filter(
              (blocked) => blocked !== settings.roomSettings.roomUnblocked,
            );
          }
        }

        if (settings.roomSettings.roomMuted && settings.roomSettings.muteDuration) {
          if (!room.roomMuted) {
            room.roomMuted = [];
          }
          const mutedUser = room.roomMuted.find(
            (muted) => muted.id === settings.roomSettings.roomMuted,
          );
          if (mutedUser) {
            room.roomMuted = room.roomMuted.filter(
              (muted) => muted.id !== settings.roomSettings.roomMuted,
            );
          }
          // 現在の日時を取得
          const now = new Date();
          // muteDurationをミリ秒に変換し、現在の日時に追加
          const muteDurationInMs = convertDurationToMs(settings.roomSettings.muteDuration);
          const mutedUntil = new Date(now.getTime() + muteDurationInMs);
          // mutedUntilを日本時間に変換
          const mutedUntilFormatted = formatDate(mutedUntil);
          room.roomMuted.push({
            id: settings.roomSettings.roomMuted,
            mutedUntil: mutedUntilFormatted,
          });
        }
        if (settings.roomSettings.roomUnmuted) {
          if (room.roomMuted) {
            room.roomMuted = room.roomMuted.filter(
              (muted) => muted.id !== settings.roomSettings.roomUnmuted,
            );
          }
        }
        await this.roomRepository.save(room);
      } else {
        this.logger.error(`Room ${settings.selectedRoom} not found in the database.`);
      }

      // 更新された部屋を取得してクライアントに送信
      const updatedRoom = await this.roomRepository.findOne({
        where: { id: settings.roomID },
      });
      if (updatedRoom) {
        this.logger.log(`Updated room: ${JSON.stringify(updatedRoom)}`);
        this.server.to(settings.selectedRoom).emit('roomName', updatedRoom.roomName);
        this.server.to(settings.selectedRoom).emit('roomType', updatedRoom.roomType);
        // AdminのUser情報を取得してクライアントに送信
        const admin = await this.userRepository.findOne({
          where: {
            userId: updatedRoom.roomAdmin,
          },
        });
        this.server.to(settings.selectedRoom).emit('roomAdmin', admin);
        // updatedRoom.roomParticipantsをUserInfoに変換
        const updatedRoomParticipants: UserInfo[] = updatedRoom.roomParticipants.map(
          (participant) => {
            return {
              userId: participant.id,
              userName: participant.name,
              icon: participant.icon,
            };
          },
        );
        this.server
          .to(settings.selectedRoom)
          .emit('updatedRoomParticipants', updatedRoomParticipants);
      } else {
        this.logger.error(`Error getting updated room.`);
      }
    } catch (error) {
      this.logger.error(`Error handling room settings: ${(error as Error).message}`);
      throw error;
    }
  }
}

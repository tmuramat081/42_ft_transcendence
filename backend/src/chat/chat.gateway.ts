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
import { UserInfo, ChatMessage, formatDate } from './tools';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
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

  @SubscribeMessage(`getLoginUser`)
  async handleGetCurrentUser(@MessageBody() user: User, @ConnectedSocket() socket: Socket) {
    try {
      const userId = user.userId;
      const loginUser = await this.userRepository.findOne({ where: { userId: Number(userId) } });
      if (!loginUser) {
        this.logger.error(`User not found: ${userId}`);
        return;
      }
      // this.logger.log(`Login user: ${JSON.stringify(loginUser)}`);
      socket.emit('loginUser', loginUser);

      // onlineUsersにユーザーを追加
      const existingUser = await this.onlineUsersRepository.findOne({
        where: { userId: loginUser.userId, name: loginUser.userName },
      });
      if (!existingUser) {
        const onlineUser = new OnlineUsers();
        onlineUser.userId = loginUser.userId;
        onlineUser.name = loginUser.userName;
        onlineUser.icon = loginUser.icon;
        await this.onlineUsersRepository.save(onlineUser);
      }
    } catch (error) {
      this.logger.error(`Error getting user: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('getRoomList')
  async handleGetRoomList(@MessageBody() LoginUser: User, @ConnectedSocket() socket: Socket) {
    try {
      // データベースからルームリストを取得
      const roomList = await this.roomRepository.find();
      // this.logger.log(`Room list: ${JSON.stringify(roomList)}`);
      // ルームリストをクライアントに送信
      socket.emit('roomList', roomList);
    } catch (error) {
      this.logger.error(`Error getting room list: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage(`logoutUser`)
  async handleLogoutUser(@MessageBody() user: User, @ConnectedSocket() socket: Socket) {
    try {
      const userId = user.userId;
      const logoutUser = await this.onlineUsersRepository.findOne({ where: { userId: userId } });
      if (!logoutUser) {
        this.logger.error(`User not found: ${userId}`);
        return;
      }
      this.logger.log(`Logout user: ${JSON.stringify(logoutUser)}`);
      await this.onlineUsersRepository.remove(logoutUser);
      // onlineUsersを取得してクライアントに送信
      const onlineUsers = await this.onlineUsersRepository.find();
      // onlineUsersをUserInfoに変換
      const onlineUsersInfo: UserInfo[] = onlineUsers.map((user) => {
        return {
          userId: user.userId,
          userName: user.name,
          icon: user.icon,
        };
      });
      // 全クライアントに送信
      this.server.emit('onlineUsers', onlineUsersInfo);
    } catch (error) {
      this.logger.error(`Error logging out user: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('getOnlineUsers')
  async handleGetOnlineUsers(@MessageBody() LoginUser: User, @ConnectedSocket() socket: Socket) {
    try {
      if (!LoginUser || !LoginUser.userId || !LoginUser.userName) {
        throw new Error('Invalid sender data.');
      }
      // オンラインユーザーを全て削除
      // await this.onlineUsersRepository.delete({});

      // 空のオンラインユーザーを削除
      // await this.deleteEmptyOnlineUsers();

      // 重複したオンラインユーザーを削除
      // await this.deleteDuplicateOnlineUsers();

      // usersService.loginUserIdsからloninUserのリストを取得
      // const onlineUserIds: number[] = await this.usersService.loginUserIds;
      // this.logger.log(`Online user ids: ${onlineUserIds}`);

      // onlineUserIdsからユーザー情報を取得
      // const onlineUsers: User[] = await this.userRepository.findByIds(onlineUserIds);

      // データベースからオンラインユーザーリストを取得
      const onlineUsers = await this.onlineUsersRepository.find();

      // this.logger.log(`Online users: ${JSON.stringify(onlineUsers)}`);

      // onlineUsersをUserInfoに変換
      const onlineUsersInfo: UserInfo[] = onlineUsers.map((user) => {
        return {
          userId: user.userId,
          userName: user.name,
          icon: user.icon,
        };
      });

      // sender以外のonlineUsersInfoをクライアントに送信
      socket.emit(
        'onlineUsers',
        onlineUsersInfo.filter((user) => user.userId !== LoginUser.userId),
      );
    } catch (error) {
      this.logger.error(`Error getting online users: ${(error as Error).message}`);
      throw error;
    }
  }

  // async deleteEmptyOnlineUsers() {
  //   // 空のオンラインユーザーを取得
  //   const emptyOnlineUsers = await this.onlineUsersRepository.find({
  //     where: {
  //       userId: -1,
  //       name: '',
  //       icon: '',
  //     },
  //   });

  //   // 取得した空のオンラインユーザーを削除
  //   await Promise.all(emptyOnlineUsers.map((user) => this.onlineUsersRepository.remove(user)));
  // }

  // async deleteDuplicateOnlineUsers() {
  //   // オンラインユーザーを全て取得
  //   const allOnlineUsers = await this.onlineUsersRepository.find();

  //   // 名前とidが一致するユーザーを検索して削除
  //   for (let i = 0; i < allOnlineUsers.length; i++) {
  //     const currentUser = allOnlineUsers[i];
  //     for (let j = i + 1; j < allOnlineUsers.length; j++) {
  //       const nextUser = allOnlineUsers[j];
  //       if (currentUser.name === nextUser.name && currentUser.userId === nextUser.userId) {
  //         await this.onlineUsersRepository.remove(nextUser);
  //         console.log('Duplicate online user deleted:', nextUser);
  //       }
  //     }
  //   }
  // }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @MessageBody() create: { LoginUser: User; roomName: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(`createRoom: ${create.LoginUser.userName} create ${create.roomName}`);
      // ルーム名が空かどうかを確認
      if (!create.roomName || !create.roomName.trim()) {
        this.logger.error('Invalid room name:', create.roomName);
        socket.emit('roomError', 'Room name cannot be empty.');
        return;
      }

      // 同じ名前のルームが存在しないか確認
      const existingRoom = await this.roomRepository.findOne({
        where: { roomName: create.roomName },
      });
      if (!existingRoom) {
        const room = new Room();
        room.roomName = create.roomName;
        room.roomParticipants = [];
        room.roomType = 'public';
        room.roomOwner = create.LoginUser.userId;
        room.createdAt = new Date();
        await this.roomRepository.save(room);
        socket.join(create.roomName);
        const rooms = await this.roomRepository.find();
        rooms.forEach((room) => {
          this.logger.log(`Room: ${JSON.stringify(room)}`);
        });
        // ルームリストを更新して全クライアントに通知
        this.server.emit('roomList', rooms);
      } else {
        this.logger.error(`Room with the same name already exists: ${create.roomName}`);
        socket.emit('roomError', 'Room with the same name already exists.');
      }
    } catch (error) {
      this.logger.error(`Error creating room: ${(error as Error).message}`);
      throw error;
    }
  }

  // @SubscribeMessage('joinRoom')
  // async handleJoinRoom(
  //   @MessageBody() join: { loginUser: User; room: string },
  //   @ConnectedSocket() socket: Socket,
  // ) {
  //   try {
  //     this.logger.log(`joinRoom: ${join.loginUser.userName} joined ${join.room}`);
  //     const rooms = [...socket.rooms].slice(0);
  //     // 既に部屋に入っている場合は退出
  //     if (rooms.length == 2) socket.leave(rooms[1]);
  //     // データベースから部屋を取得
  //     const room = await this.roomRepository.findOne({ where: { roomName: join.room } });
  //     // 参加者リストを更新
  //     if (room) {
  //       if (!room.roomParticipants) {
  //         room.roomParticipants = [];
  //       }
  //       // 参加者が100人を超える場合はエラーを返す
  //       if (room.roomParticipants.length >= 100) {
  //         this.logger.error('Room is full');
  //         socket.emit('roomError', 'Room is full.');
  //         return;
  //       }
  //       // ユーザーが存在してないか確認
  //       const existingUser = room.roomParticipants.find(
  //         (participant) => participant.name === join.loginUser.userName,
  //         (participant) => participant.id === join.loginUser.userId,
  //       );
  //       if (!existingUser) {
  //         // userRepositoryからユーザー情報を取得して追加
  //         const user = await this.userRepository.findOne({
  //           where: { userId: join.loginUser.userId },
  //         });
  //         if (!user) {
  //           this.logger.error(`User ${join.loginUser.userName} not found in the database.`);
  //           return;
  //         }
  //         room.roomParticipants.push({
  //           id: user.userId,
  //           name: user.userName,
  //           icon: user.icon,
  //         });
  //       }
  //       await this.roomRepository.save(room);
  //     } else {
  //       this.logger.error(`Room ${join.room} not found in the database.`);
  //     }
  //     // ソケットにルームに参加させる
  //     socket.join(join.room);
  //     // 参加者リストを取得してクライアントに送信
  //     const updatedRoom = await this.roomRepository.findOne({ where: { roomName: join.room } });
  //     if (updatedRoom) {
  //       // updatedRoom.roomParticipantsをUserInfoに変換
  //       const roomParticipants: UserInfo[] = updatedRoom.roomParticipants.map((participant) => {
  //         return {
  //           userId: participant.id,
  //           userName: participant.name,
  //           icon: participant.icon,
  //         };
  //       });
  //       this.server.to(join.room).emit('roomParticipants', roomParticipants);
  //     } else {
  //       this.logger.error(`Error getting updated room.`);
  //     }
  //     // チャットログを取得してクライアントに送信
  //     const chatLogs = await this.chatLogRepository.find({ where: { roomName: join.room } });
  //     if (chatLogs) {
  //       this.logger.log(`Chat logs: ${JSON.stringify(chatLogs)}`);
  //       // chatLogsをchatmessage[]に変換
  //       const chatMessages: ChatMessage[] = chatLogs.map((log) => {
  //         return {
  //           user: log.sender,
  //           photo: log.icon,
  //           text: log.message,
  //           timestamp: log.timestamp,
  //         };
  //       });
  //       this.server.to(join.room).emit('chatLogs', chatMessages);
  //     } else {
  //       this.logger.error(`Error getting chat logs.`);
  //     }
  //   } catch (error) {
  //     const errorMessage = (error as Error).message;
  //     this.logger.error(`Error joining room: ${errorMessage}`);
  //     throw error;
  //   }
  // }
}

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
  ) {}

  @SubscribeMessage('getRoomList')
  async handleGetRoomList(@MessageBody() sender: UserInfo, @ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`Get room list: ${sender.userName}`);
      // データベースからルームリストを取得
      const roomList = await this.roomRepository.find();
      this.logger.log(`Room list: ${JSON.stringify(roomList)}`);
      // ルームリストをクライアントに送信
      socket.emit('roomList', roomList);
    } catch (error) {
      this.logger.error(`Error getting room list: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('getGameList')
  async handleGetGameList(@MessageBody() sender: UserInfo, @ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`Get game list: ${sender.userName}`);
      // データベースからゲームルームリストを取得
      const gameList = await this.gameRoomRepository.find();
      this.logger.log(`Game list: ${JSON.stringify(gameList)}`);
      // gameListをstring[]に変換
      const games: string[] = gameList.map((game) => game.roomName);
      // ゲームルームリストをクライアントに送信
      socket.emit('gameList', games);
    } catch (error) {
      this.logger.error(`Error getting game list: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage(`getLoginUser`)
  async handleGetCurrentUser(@MessageBody() user: User, @ConnectedSocket() socket: Socket) {
    try {
      const userId = user.userId;
      const loginUser = await this.userRepository.findOne({ where: { userId: Number(userId) } });
      if (!loginUser) {
        this.logger.error(`User not found: ${userId}`);
        return;
      }
      this.logger.log(`Login user: ${JSON.stringify(loginUser)}`);
      socket.emit('loginUser', loginUser);
    } catch (error) {
      this.logger.error(`Error getting user: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('getOnlineUsers')
  async handleGetOnlineUsers(@MessageBody() sender: UserInfo, @ConnectedSocket() socket: Socket) {
    try {
      if (!sender || !sender.userId || !sender.userName) {
        throw new Error('Invalid sender data.');
      }
      this.logger.log(`Get online users: ${sender.userName}`);

      // ダミーユーザーを登録
      // await this.createDummyUsers();

      // すでにログインユーザーが存在するかどうかを確認
      const existingUser = await this.onlineUsersRepository.findOne({
        where: { userId: sender.userId, name: sender.userName },
      });
      if (!existingUser) {
        const onlineUser = new OnlineUsers();
        onlineUser.userId = sender.userId;
        onlineUser.name = sender.userName;
        onlineUser.icon = sender.icon;
        await this.onlineUsersRepository.save(onlineUser);
      }

      // 空のオンラインユーザーを削除
      await this.deleteEmptyOnlineUsers();

      // 重複したオンラインユーザーを削除
      await this.deleteDuplicateOnlineUsers();

      // データベースからオンラインユーザーリストを取得
      const onlineUsers = await this.onlineUsersRepository.find();

      this.logger.log(`Online users: ${JSON.stringify(onlineUsers)}`);

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
        onlineUsersInfo.filter((user) => user.userId !== sender.userId),
      );
    } catch (error) {
      this.logger.error(`Error getting online users: ${(error as Error).message}`);
      throw error;
    }
  }

  async deleteEmptyOnlineUsers() {
    // 空のオンラインユーザーを取得
    const emptyOnlineUsers = await this.onlineUsersRepository.find({
      where: {
        userId: -1,
        name: '',
        icon: '',
      },
    });

    // 取得した空のオンラインユーザーを削除
    await Promise.all(emptyOnlineUsers.map((user) => this.onlineUsersRepository.remove(user)));
    console.log('Empty online users deleted:', emptyOnlineUsers);
  }

  async deleteDuplicateOnlineUsers() {
    // オンラインユーザーを全て取得
    const allOnlineUsers = await this.onlineUsersRepository.find();
    this.logger.log(`All online users: ${JSON.stringify(allOnlineUsers)}`);

    // 名前とidが一致するユーザーを検索して削除
    for (let i = 0; i < allOnlineUsers.length; i++) {
      const currentUser = allOnlineUsers[i];
      for (let j = i + 1; j < allOnlineUsers.length; j++) {
        const nextUser = allOnlineUsers[j];
        if (currentUser.name === nextUser.name && currentUser.userId === nextUser.userId) {
          await this.onlineUsersRepository.remove(nextUser);
          console.log('Duplicate online user deleted:', nextUser);
        }
      }
    }
  }

  // ダミーユーザーを登録
  async createDummyUsers() {
    const dummyUsers: UserInfo[] = [
      {
        userId: 11,
        userName: 'Bob',
        icon: 'https://www.plazastyle.com/images/charapla-spongebob/img_character01.png',
      },
      {
        userId: 12,
        userName: 'Patrick',
        icon: 'https://www.plazastyle.com/images/charapla-spongebob/img_character02.png',
      },
      {
        userId: 13,
        userName: 'plankton',
        icon: 'https://www.plazastyle.com/images/charapla-spongebob/img_character05.png',
      },
      {
        userId: 14,
        userName: 'sandy',
        icon: 'https://www.plazastyle.com/images/charapla-spongebob/img_character06.png',
      },
      {
        userId: 15,
        userName: 'Mr.krabs',
        icon: 'https://www.plazastyle.com/images/charapla-spongebob/img_character04.png',
      },
      {
        userId: 16,
        userName: 'gary',
        icon: 'https://www.plazastyle.com/images/charapla-spongebob/img_character07.png',
      },
    ];
    await Promise.all(
      dummyUsers.map(async (user) => {
        const onlineUser = new OnlineUsers();
        onlineUser.userId = user.userId;
        onlineUser.name = user.userName;
        onlineUser.icon = user.icon;
        await this.onlineUsersRepository.save(onlineUser);
      }),
    );
  }

  @SubscribeMessage('talk')
  async handleMessage(
    @MessageBody() data: { selectedRoom: string; loginUser: User; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(`loginUser: ${data.loginUser}`);
      if (!data.selectedRoom || !data.loginUser || !data.message) {
        this.logger.error('Invalid chat message data:', data);
        return;
      }
      this.logger.log(
        `${data.selectedRoom} received ${data.message} from ${data.loginUser.userName}`,
      );

      // チャットログを保存
      const chatLog = new ChatLog();
      chatLog.roomName = data.selectedRoom;
      chatLog.sender = data.loginUser.userName;
      chatLog.icon = data.loginUser.icon;
      chatLog.message = data.message;
      chatLog.timestamp = formatDate(new Date());
      await this.chatLogRepository.save(chatLog);
      this.logger.log(`Saved chatLog: ${JSON.stringify(chatLog)}`);

      // チャットログを取得
      const chatLogs = await this.chatLogRepository.find({
        where: { roomName: data.selectedRoom },
      });
      this.logger.log(`Chat logs: ${JSON.stringify(chatLogs)}`);
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

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @MessageBody() create: { sender: UserInfo; roomName: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(`createRoom: ${create.sender.userName} create ${create.roomName}`);
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

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() join: { loginUser: User; room: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(`joinRoom: ${join.loginUser.userName} joined ${join.room}`);
      const rooms = [...socket.rooms].slice(0);
      // 既に部屋に入っている場合は退出
      if (rooms.length == 2) socket.leave(rooms[1]);
      // データベースから部屋を取得
      const room = await this.roomRepository.findOne({ where: { roomName: join.room } });
      // 参加者リストを更新
      if (room) {
        if (!room.roomParticipants) {
          room.roomParticipants = [];
        }
        // 参加者が100人を超える場合はエラーを返す
        if (room.roomParticipants.length >= 100) {
          this.logger.error('Room is full');
          socket.emit('roomError', 'Room is full.');
          return;
        }
        // ユーザーが存在してないか確認
        const existingUser = room.roomParticipants.find(
          (participant) => participant.name === join.loginUser.userName,
          (participant) => participant.id === join.loginUser.userId,
        );
        if (!existingUser) {
          // onlineUsersRepositoryからユーザー情報を取得して追加
          const user = await this.onlineUsersRepository.findOne({
            where: { userId: join.loginUser.userId },
          });
          if (!user) {
            this.logger.error(`User ${join.loginUser.userName} not found in the database.`);
            return;
          }
          room.roomParticipants.push({
            id: user.userId,
            name: user.name,
            icon: user.icon,
          });
        }
        await this.roomRepository.save(room);
      } else {
        this.logger.error(`Room ${join.room} not found in the database.`);
      }
      // ソケットにルームに参加させる
      socket.join(join.room);
      // 参加者リストを取得してクライアントに送信
      const updatedRoom = await this.roomRepository.findOne({ where: { roomName: join.room } });
      if (updatedRoom) {
        this.logger.log(`Updated room: ${JSON.stringify(updatedRoom)}`);
        // updatedRoom.roomParticipantsをUserInfoに変換
        const roomParticipants: UserInfo[] = updatedRoom.roomParticipants.map((participant) => {
          return {
            userId: participant.id,
            userName: participant.name,
            icon: participant.icon,
          };
        });
        this.server.to(join.room).emit('roomParticipants', roomParticipants);
      } else {
        this.logger.error(`Error getting updated room.`);
      }
      // チャットログを取得してクライアントに送信
      const chatLogs = await this.chatLogRepository.find({ where: { roomName: join.room } });
      if (chatLogs) {
        this.logger.log(`Chat logs: ${JSON.stringify(chatLogs)}`);
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
      throw error;
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() leave: { sender: UserInfo; room: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(`leaveRoom: ${leave.sender.userName} left ${leave.room}`);
      // データベースから部屋を取得
      const room = await this.roomRepository.findOne({ where: { roomName: leave.room } });

      // 参加者リストを更新
      if (room) {
        if (room.roomParticipants) {
          room.roomParticipants = room.roomParticipants.filter(
            (participant) => participant.name !== leave.sender.userName,
          );
          await this.roomRepository.save(room);
        }
      } else {
        this.logger.error(`Room ${leave.room} not found in the database.`);
      }

      // 更新された参加者リストを取得してクライアントに送信
      const updatedRoom = await this.roomRepository.findOne({ where: { roomName: leave.room } });
      if (updatedRoom) {
        this.server.to(leave.room).emit('roomParticipants', updatedRoom.roomParticipants);
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
  async handleDeleteRoom(@MessageBody() delet: { sender: UserInfo; room: string }) {
    try {
      this.logger.log(`${delet.sender.userName} deleted Room: ${delet.room}`);

      // データベースから指定のルームを削除
      const deletedRoom = await this.roomRepository.findOne({
        where: { roomName: delet.room },
      });
      if (deletedRoom) {
        await this.roomRepository.remove(deletedRoom);
        this.logger.log(`Room ${delet.room} has been deleted from the database.`);
      } else {
        this.logger.error(`Room ${delet.room} not found in the database.`);
      }

      // 新しい roomList を取得してコンソールに出力
      const updatedRoomList = await this.roomRepository.find();
      this.logger.log('Updated roomList:', updatedRoomList);

      this.server.emit('roomList', updatedRoomList);
    } catch (error) {
      this.logger.error(`Error deleting room: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('inviteToRoom')
  async handleInviteToRoom(
    @MessageBody() data: { sender: UserInfo; room: string; invitee: UserInfo },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(
        `Invite to room: ${data.sender.userName} invited ${data.invitee.userName} to ${data.room}`,
      );

      // クライアントに招待情報を送信
      this.server.to(String(data.invitee.userId)).emit('roomInvitation', {
        sender: data.sender,
        room: data.room,
      });
    } catch (error) {
      this.logger.error(`Error inviting to room: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('inviteToGame')
  async handleInviteToGame(
    @MessageBody() data: { sender: UserInfo; game: string; invitee: UserInfo },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(
        `Invite to game: ${data.sender.userName} invited ${data.invitee.userName} to game: ${data.game}`,
      );

      // クライアントに招待情報を送信
      this.server.to(String(data.invitee.userId)).emit('gameInvitation', {
        sender: data.sender,
        game: data.game,
      });
    } catch (error) {
      this.logger.error(`Error inviting to game: ${(error as Error).message}`);
      throw error;
    }
  }
}

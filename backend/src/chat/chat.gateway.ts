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

    @InjectRepository(CurrentUser)
    private currentUserRepository: Repository<CurrentUser>,

    @InjectRepository(DirectMessage)
    private directMessageRepository: Repository<DirectMessage>,

    @InjectRepository(OnlineUsers)
    private onlineUsersRepository: Repository<OnlineUsers>,
  ) {}

  @SubscribeMessage('talk')
  async handleMessage(
    @MessageBody() data: { selectedRoom: string; sender: UserInfo; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (
        !data.sender ||
        !data.sender.ID ||
        !data.sender.name ||
        !data.sender.icon ||
        !data.message
      ) {
        this.logger.error('Invalid chat message data:', data);
        return;
      }
      this.logger.log(
        `${data.selectedRoom} received ${data.message} from ${data.sender.name} ${data.sender.ID}`,
      );

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

      // チャットログを保存
      const chatLog = new ChatLog();
      chatLog.roomName = data.selectedRoom;
      chatLog.sender = data.sender.ID;
      chatLog.icon = data.sender.icon;
      chatLog.message = data.message;
      chatLog.timestamp = formatDate(new Date());
      await this.chatLogRepository.save(chatLog); // チャットログをデータベースに保存
      this.logger.log(`Saved chatLog: ${JSON.stringify(chatLog)}`);

      const chatMessage: ChatMessage = {
        user: data.sender.ID,
        photo: data.sender.icon,
        text: data.message,
        timestamp: chatLog.timestamp,
      };

      this.server.to(data.selectedRoom).emit('update', chatMessage);
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
      this.logger.log(`createRoom: ${create.sender.name} create ${create.roomName}`);
      // ルーム名が空かどうかを確認
      if (!create.roomName || !create.roomName.trim()) {
        this.logger.error('Invalid room name:', create.roomName);
        socket.emit('roomError', 'Room name cannot be empty.');
        return; // 空の場合は処理を中断
      }

      // 同じ名前のルームが存在しないか確認
      const existingRoom = await this.roomRepository.findOne({
        where: { roomName: create.roomName },
      });
      if (!existingRoom) {
        const room = new Room();
        room.roomName = create.roomName; // ルーム名として入力された値を使用
        room.roomParticipants = []; // 参加者リストを空の配列で初期化
        await this.roomRepository.save(room); // 新しいルームをデータベースに保存
        socket.join(create.roomName);
        const rooms = await this.roomRepository.find();
        rooms.forEach((room) => {
          this.logger.log(`Room: ${JSON.stringify(room)}`);
        });
        this.server.emit('roomList', rooms); // ルームリストを更新して全クライアントに通知
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
    @MessageBody() join: { sender: UserInfo; room: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log(`joinRoom: ${join.sender.name} joined ${join.room}`);
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
        room.roomParticipants.push({
          id: join.sender.ID,
          name: join.sender.name,
          icon: join.sender.icon,
        });
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
        this.server.to(join.room).emit('roomParticipants', updatedRoom.roomParticipants);
      } else {
        this.logger.error(`Error getting updated room.`);
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
      this.logger.log(`leaveRoom: ${leave.sender.name} left ${leave.room}`);
      // データベースから部屋を取得
      const room = await this.roomRepository.findOne({ where: { roomName: leave.room } });

      // 参加者リストを更新
      if (room) {
        if (room.roomParticipants) {
          room.roomParticipants = room.roomParticipants.filter(
            (participant) => participant.name !== leave.sender.name,
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
      this.logger.log(`${delet.sender.name} deleted Room: ${delet.room}`);

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

  @SubscribeMessage('getRoomList')
  async handleGetRoomList(@MessageBody() sender: UserInfo, @ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`Get room list: ${sender.ID}`);
      // データベースからルームリストを取得
      const roomList = await this.roomRepository.find();
      // ルームリストをクライアントに送信
      socket.emit('roomList', roomList);
    } catch (error) {
      this.logger.error(`Error getting room list: ${(error as Error).message}`);
      throw error;
    }
  }

  @SubscribeMessage('getOnlineUsers')
  async handleGetOnlineUsers(@MessageBody() sender: UserInfo, @ConnectedSocket() socket: Socket) {
    try {
      this.logger.log(`Get online users: ${sender.ID}`);

      // データベースcurrentUserにsenderを保存
      const currentUser = new CurrentUser();
      currentUser.userId = sender.ID;
      currentUser.name = sender.name;
      currentUser.icon = sender.icon;
      await this.currentUserRepository.save(currentUser);
      this.logger.log(`currentUser: ${JSON.stringify(currentUser)}`);

      // 空のオンラインユーザーを削除
      await this.deleteEmptyOnlineUsers();

      if (!sender || !sender.ID || !sender.name || !sender.icon) {
        throw new Error('Invalid sender data. Cannot save to database.');
      }

      // ダミーユーザーを登録
      // await this.createDummyUsers();

      // OnlineUsersエンティティのインスタンスを作成し、データベースに保存
      const onlineUser = new OnlineUsers();
      onlineUser.userId = sender.ID;
      onlineUser.name = sender.name;
      onlineUser.icon = sender.icon;
      await this.onlineUsersRepository.save(onlineUser);

      // 重複したオンラインユーザーを削除
      await this.deleteDuplicateOnlineUsers();

      // データベースからオンラインユーザーリストを取得
      const onlineUsers = await this.onlineUsersRepository.find();

      this.logger.log(`Online users: ${JSON.stringify(onlineUsers)}`);

      // sender以外のオンラインユーザーリストをクライアントに送信
      socket.emit(
        'onlineUsers',
        onlineUsers.filter((user) => user.name !== sender.name),
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
        userId: '',
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

    // 名前とアイコンが一致するユーザーを検索して削除
    for (let i = 0; i < allOnlineUsers.length; i++) {
      const currentUser = allOnlineUsers[i];
      for (let j = i + 1; j < allOnlineUsers.length; j++) {
        const nextUser = allOnlineUsers[j];
        if (currentUser.name === nextUser.name && currentUser.icon === nextUser.icon) {
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
        ID: 'dummy1',
        name: 'Patrick',
        icon: 'https://www.plazastyle.com/images/charapla-spongebob/img_character02.png',
      },
      {
        ID: 'dummy2',
        name: 'plankton',
        icon: 'https://www.plazastyle.com/images/charapla-spongebob/img_character05.png',
      },
      {
        ID: 'dummy3',
        name: 'sandy',
        icon: 'https://www.plazastyle.com/images/charapla-spongebob/img_character06.png',
      },
      {
        ID: 'dummy4',
        name: 'Mr.krabs',
        icon: 'https://www.plazastyle.com/images/charapla-spongebob/img_character04.png',
      },
      {
        ID: 'dummy5',
        name: 'gary',
        icon: 'https://www.plazastyle.com/images/charapla-spongebob/img_character07.png',
      },
    ];
    await Promise.all(
      dummyUsers.map(async (user) => {
        const onlineUser = new OnlineUsers();
        onlineUser.userId = user.ID;
        onlineUser.name = user.name;
        onlineUser.icon = user.icon;
        await this.onlineUsersRepository.save(onlineUser);
      }),
    );
  }

  //   @SubscribeMessage('getCurrentUser')
  //   async handleGetCurrentUser(@MessageBody() id: string, @ConnectedSocket() socket: Socket) {
  //     try {
  //       this.logger.log(`getCurrentUser: ${id}`);
  //       // データベースからオンラインユーザーを取得
  //       const user = await this.onlineUsersRepository.findOne({ where: { userId: id } });
  //       if (user) {
  //         this.logger.log(`Current user: ${JSON.stringify(user)}`);
  //         // クライアントに送信
  //         socket.emit('currentUser', user);
  //       } else {
  //         this.logger.error(`User ${id} not found in the database.`);
  //       }
  //     } catch (error) {
  //       this.logger.error(`Error getting current user: ${(error as Error).message}`);
  //       throw error;
  //     }
  //   }

  //   @SubscribeMessage('startDM')
  //   async handleStartDM(
  //     @MessageBody() payload: { sender: UserInfo; recipient: UserInfo },
  //     @ConnectedSocket() socket: Socket,
  //   ) {
  //     try {
  //       if (!payload.sender || !payload.recipient) {
  //         this.logger.error('Invalid DM data:', payload);
  //         return;
  //       }
  //       this.logger.log(`startDM: ${payload.sender.name} started DM with ${payload.recipient.name}`);
  //       // 送信者と受信者のエンティティを取得
  //       const senderUser = await this.onlineUsersRepository.findOne({
  //         where: { name: payload.sender.name },
  //       });
  //       const recipientUser = await this.onlineUsersRepository.findOne({
  //         where: { name: payload.recipient.name },
  //       });

  //       // Userが存在しない場合はエラー
  //       if (!senderUser) {
  //         this.logger.error(`Sender ${payload.sender.name} not found in the database.`);
  //         return;
  //       }
  //       if (!recipientUser) {
  //         this.logger.error(`Recipient ${payload.recipient.name} not found in the database.`);
  //         return;
  //       }

  //       // クライアントに送信
  //       this.server.to(payload.sender.ID).emit('readytoDM', payload.recipient);
  //     } catch (error) {
  //       this.logger.error(`Error starting DM: ${(error as Error).message}`);
  //       throw error;
  //     }
  //   }

  //   @SubscribeMessage('sendDM')
  //   async handleSendDM(
  //     @MessageBody() payload: { sender: string; receiver: string; message: string },
  //   ) {
  //     try {
  //       if (
  //         !payload.sender ||
  //         !payload.receiver ||
  //         !payload.message ||
  //         !payload.sender.trim() ||
  //         !payload.receiver.trim() ||
  //         !payload.message.trim()
  //       ) {
  //         console.error('Invalid DM data:', payload);
  //         return { success: false, message: 'Invalid DM data' };
  //       }
  //       this.logger.log(`sendDM: ${payload.sender} sent DM to ${payload.receiver}`);
  //       // 送信者と受信者のエンティティを取得
  //       const senderUser = await this.onlineUsersRepository.findOne({
  //         where: { name: payload.sender },
  //       });
  //       const recipientUser = await this.onlineUsersRepository.findOne({
  //         where: { name: payload.receiver },
  //       });

  //       // Userが存在しない場合は新規作成
  //       if (!senderUser) {
  //         await this.onlineUsersRepository.save({ name: payload.sender });
  //       }
  //       if (!recipientUser) {
  //         await this.onlineUsersRepository.save({ name: payload.receiver });
  //       }

  //       function formatDate(date: Date): string {
  //         const options: Intl.DateTimeFormatOptions = {
  //           year: 'numeric',
  //           month: '2-digit',
  //           day: '2-digit',
  //           hour: '2-digit',
  //           minute: '2-digit',
  //           hour12: false,
  //           timeZone: 'Asia/Tokyo',
  //         };
  //         return date.toLocaleString('ja-JP', options);
  //       }

  //       // DirectMessageを作成して保存
  //       const directMessage = new DirectMessage();
  //       directMessage.senderId = payload.sender;
  //       directMessage.recipientId = payload.receiver;
  //       directMessage.message = payload.message;
  //       directMessage.timestamp = formatDate(new Date());
  //       await this.directMessageRepository.save(directMessage);
  //       this.logger.log(`Saved directMessage: ${JSON.stringify(directMessage)}`);

  //       const dmData: ChatMessage = {
  //         user: payload.sender,
  //         photo: senderUser?.icon || '',
  //         text: payload.message,
  //         timestamp: directMessage.timestamp,
  //       };

  //       // クライアントに送信
  //       this.server.to(payload.receiver).emit('updateDM', dmData);

  //       // 成功メッセージを返す
  //       return { success: true, message: 'DM sent successfully' };
  //     } catch (error) {
  //       // エラーハンドリング
  //       console.error('Error sending DM:', error);
  //       return { success: false, message: 'Failed to send DM' };
  //     }
  //   }
}

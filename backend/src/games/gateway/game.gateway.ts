import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS_GAME } from '../game.constant';

// maoyagi
//?
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
// service
import { RecordsRepository } from '../gameRecord.repository';
// 見直し
import { UsersService } from '@/users/users.service';
import { AuthService } from '@/auth/auth.service';
import { v4 as uuidv4 } from 'uuid';
import {
  Player,
  Ball,
  BallVec,
  GameSetting,
  RoomInfo,
  GameInfo,
  FinishedGameInfo,
  Friend,
  Invitation,
  DiffucultyLevel,
  GameState,
  UserStatus,
  SocketAuth,
  FriendGameInfo
} from '../types/game'

import { GetInvitedListDto } from '../dto/getInvitedList.dto';
import { InviteFriendDto } from '../dto/inviteFriend.dto';
import { CancelInvitationDto } from '../dto/cancelInvitation.dto';
import { DenyInvitationDto } from '../dto/denyInvitation.dto';
import { AcceptInvitationDto } from '../dto/acceptInvitation.dto';
import { JoinRoomDto } from '../dto/joinRoom.dto';
import { WatchFriendGameDto } from '../dto/watchFriendGame.dto';
import { PlayGameDto } from '../dto/playGame.dto';
import { UpdatePlayerPosDto } from '../dto/updatePlayerPos.dto';
import { GetUserStatusByIdtDto } from '../dto/getUserStatusById.dto';
import { WatchGameDto } from '../dto/watchGame.dto';

const Easy = 6;
const Normal = 12;
const Hard = 30;

// 招待リスト
class InvitationList {
  items: Invitation[] = [];

  // ホストIDは一つであることを確認。複数人招待できない
  insert(invitation: Invitation): boolean {
    const found = this.items.find((item) => item.hostId === invitation.hostId);
    if (found === undefined) {
      this.items.push(invitation);
      return true;
    }
    return false;
  }

  delete(hostId: number): boolean {
    // const index = this.items.findIndex((item) => item.hostId === hostId);
    // if (index !== -1) {
    //   this.items.splice(index, 1);
    //   return true;
    // }
    // return false;
    const oldLen = this.items.length;
    this.items = this.items.filter((item) => item.hostId !== hostId);
    return oldLen !== this.items.length;
  }

  find(hostId: number): Invitation | undefined {
    return this.items.find((item) => item.hostId === hostId);
  }

  // ゲストが招待を受けたホストのリストを取得
  findHosts(userId: number): number[] {
    const found = this.items.filter((item) => item.guestId === userId);
    if (found === undefined) {
      return undefined;
    }
    return found.map((item) => item.hostId);
  }
}

type GameRoomConnectionDto = {
  roomId: string;
  userId: string;
};

// 接続者情報
type ConnectedUser = {
  client: Socket;
  userId: string;
};

//@WebSocketGateway({ cors: { origin: '*' } })
@WebSocketGateway({ cors: { origin: '*' }, namespace: '/game' })
//?
@UsePipes(new ValidationPipe())
export class GameGateway {
  // ゲームの設定
  // インスタンス間で共有するため、staticに設定
  static initialHeight = 260;
  static ballInitialX = 500;
  static ballInitialY = 300;
  // ボールの半径
  static ballRadius = 10;
  // ボールの初期ベクトル
  static ballInitialXVec = -1;
  static ballInitialYVec = 1;
  // ボールの速度
  static ballSpeed = 5;
  // heightPos, lowestPos ボールの移動範囲　上下
  static heightPos = 10;
  static lowestPos = 490;
  // leftEnd, rightEnd ボールの移動範囲　左右
  static leftEnd = 40;
  static rightEnd = 960;
  // defaultSetting ゲームの初期設定
  static defaultSetting: GameSetting = {
    difficulty: DiffucultyLevel.NORMAL,
    matchPoint: 5,
    player1Score: 0,
    player2Score: 0,
  };

  // ゲームフィールドのサイズ
  static boardWidth = 1000;
  static boardHeight = 600;

  // バーの移動速度
  static barSpeed = 30;

  // バーのサイズ
  static barLength = GameGateway.boardHeight / Normal;

  // アクティブなゲームルームリスト
  gameRooms: RoomInfo[] = [];

  // ゲームルームに参加するのを待っているプレイヤーリスト
  waitingQueue: Player[] = [];

  // アクティブな招待リスト
  invitationList: InvitationList = new InvitationList();

  // ユーザーIDとゲームソケットのマッピング
  userSocketMap: Map<number, Set<string>> = new Map();

  // 実際にプレイしているユーザーID
  //playingUserIds: Set<number> = new Set();
  playingUserIds: number[] = [];



  @WebSocketServer()
  server: Server;

  // ロガー
  private logger: Logger = new Logger('GameGateway');

  constructor (
    // TODO: serviceにする
    private readonly recordsRepository: RecordsRepository,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ){}

  // メソッド
  // headerでコネクションやる？
  getIdFromSocket(socket: Socket): number {

    this.logger.log(`socket.handshake.auth: ${socket.handshake.auth}`);
    // id情報が入っている
    const socketAuth = socket.handshake.auth as SocketAuth;
    return socketAuth.userId;
  }

  isPlayingUserId(userId: number): boolean {
    if ( this.playingUserIds.includes(userId) ) {
      return true;
    }
    return false;
  }

  addPlayingUserId(userId: number) {
    if (!this.isPlayingUserId(userId)) {
      this.logger.log(`addPlayingUserId: ${userId}`);
      this.playingUserIds.push(userId);

      // ユーザーのステータスを更新
      this.server.emit('updateStatus', {
        userId: userId,
        status: UserStatus.PLAYING,
      })
    }
  }

  removePlayingUserId(userId: number) {
    if (this.isPlayingUserId(userId)) {
      this.logger.log(`removePlayingUserId: ${userId}`);
      // ユーザーIDを含まないリストを作成
      this.playingUserIds = this.playingUserIds.filter((id) => id !== userId);

      // ユーザーのステータスを更新
      this.server.emit('updateStatus', {
        userId: userId,
        status: UserStatus.ONLINE,
      });
    }
  }

  // 部屋のプレイヤーをplayingListから削除
  removePlayingUsersFromRoom(room: RoomInfo) {
    room.supporters.map((supporter) => {
      const supporterId = supporter.id;
      this.removePlayingUserId(supporterId);
    });

    this.removePlayingUserId(room.player1.id);
    this.removePlayingUserId(room.player2.id);
  }

  // ボールの方向をランダムに設定　上下
  setBallVec() {
    return Math.random() * (Math.random() < 0.5 ? -1 : 1);
  }

  // ポイントによってゲームの設定をするプレイヤーを決定
  updatePlayerStatus(player1: Player, player2, gameType: string) {
    const playerNames: [string, string] = [player1.name, player2.name];

    // 状態
    const select = gameType + ':select'
    const standBy = gameType + ':standBy'

    if (player1.point <= player2.point) {
      player1.socket.emit(select, playerNames);
      player2.socket.emit(standBy, playerNames);
    } else {
      player2.socket.emit(select, playerNames);
      player1.socket.emit(standBy, playerNames);
    }
  }

  isStartingGame(id: number): boolean {
    // ゲーム中かを判定
    const isStartingGame = this.gameRooms.find((room) => {
      this.gameRooms.find((room) => {
        room.player1.id === id || room.player2.id === id;
      }) !== undefined;
    })
    if (isStartingGame) return true;

    // 待機中かを判定
    const isWaitingGame = this.waitingQueue.find((player) => player.id === id);
    if (isWaitingGame) return true;

    // 招待リストにあるかを判定
    const isInvited = this.invitationList.find(id) !== undefined;
    if (isInvited) return true;

    return false;

  }
  // private rooms: { [roomId: string]: ConnectedUser[] } = {};

  // ユーザーの入室処理
  // @SubscribeMessage('joinGameRoom')
  // async handleJoinRoom(
  //   @MessageBody() data: GameRoomConnectionDto,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   console.log(`Client ${client.id} joined room: ${data.roomId}`);
  //   if (!this.rooms[data.roomId]) {
  //     this.rooms[data.roomId] = [];
  //   }
  //   this.rooms[data.roomId].push({ client: client, userId: data.userId });

  //   await client.join(data.roomId);

  //   // ルームが規定人数に達した場合、ゲーム開始通知を送信
  //   if (this.rooms[data.roomId].length === 2) {
  //     this.server.to(data.roomId).emit(SOCKET_EVENTS_GAME.START_GAME, 'Game is starting');
  //   }

  //   // ルームの参加者情報を更新
  //   this.server
  //     .to(data.roomId)
  //     .emit(
  //       SOCKET_EVENTS_GAME.USERS_IN_ROOM,
  //       this.rooms[data.roomId]?.map((client) => client.userId),
  //     );
  // }

  // @SubscribeMessage('getGameEntries')
  // handleGetEntries(@MessageBody() data: GameRoomConnectionDto, @ConnectedSocket() client: Socket) {
  //   const userIds = this.rooms[data.roomId]?.map((client) => client.userId) || [];
  //   client.emit('usersInRoom', userIds);
  // }

  // afterInit(_client: Server) {
  //   console.log('Init');
  // }

  handleConnection(socket: Socket) {
    //socket.emit('message', 'Welcome to the game room');

    // maoyagi
    const id = this.getIdFromSocket(socket);
  
    this.logger.log(`Client connected: ${id}!!!!!!!!!!!!!!!!!!!!`);
    // console.log(`Client connected: ${id}!!!!!!!!!!!!!!!!!!!!!!!!`);

    this.server.emit('updateStatus', {
      userId: id,
      status: UserStatus.ONLINE,
    })
  }

  handleDisconnect(socket: Socket) {
    // // ルームからクライアントを削除
    // let roomIdToDelete: string | undefined;
    // for (const [roomId, users] of Object.entries(this.rooms)) {
    //   const index = users.findIndex((user) => user.client.id === client.id);
    //   if (index !== -1) {
    //     users.splice(index, 1); // クライアントをルームから削除
    //     roomIdToDelete = roomId;
    //     if (users.length === 0) {
    //       delete this.rooms[roomId]; // ルームが空になったら削除
    //     }
    //     break;
    //   }
    // }
    // if (roomIdToDelete) {
    //   this.server.to(roomIdToDelete).emit('playerLeft', `${client.id} left the room`);
    //   // ルームの参加者が1人だけになった場合、ゲームを中止するなどの処理をここに追加
    //   if (this.rooms[roomIdToDelete] && this.rooms[roomIdToDelete].length === 1) {
    //     this.server
    //       .to(roomIdToDelete)
    //       .emit('gameStopped', 'The game has stopped because a player left');
    //   }
    // }
    // // ルームの参加者情報を更新
    // this.server
    //   .to(roomIdToDelete)
    //   .emit(
    //     SOCKET_EVENTS_GAME.USERS_IN_ROOM,
    //     this.rooms[roomIdToDelete]?.map((client) => client.userId),
    //   );

    //maoyagi
    const id = this.getIdFromSocket(socket);
    this.logger.log(`Client disconnected: ${id}`);

    this.removePlayingUserId(id);

    this.server.emit('updateStatus', {
      userId: id,
      status: UserStatus.OFFLINE,
    })

    // 招待リストから削除
    const inivitation = this.invitationList.find(id)
    if (inivitation !== undefined) {
      // 招待を受けているホストに通知
      const guestSocketIds = this.userSocketMap.get(inivitation.guestId);
      if (guestSocketIds !== undefined) {
        guestSocketIds.forEach((socketId) => {
          this.server.to(socketId).emit('cancelInvitation', inivitation.hostId);
        });
      }
    this.invitationList.delete(id);
    }

    // 切断したユーザーのソケットIDを削除
    const socketIds = this.userSocketMap.get(id);
    if (socketIds !== undefined) {
      // fillterでもいい
      this.userSocketMap.delete(id);
    }

    // ゲームルームと待機リストから削除
    this.gameRooms = this.gameRooms.filter((room) => {
      room.player1.socket.id !== socket.id && room.player2.socket.id !== socket.id;
    })

    this.waitingQueue = this.waitingQueue.filter((player) => player.socket.id !== socket.id);
  }


  //maoyagi ver
  //game開始
  @SubscribeMessage('playStart')
  async joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: JoinRoomDto,
  ): Promise<boolean> {
    // ルームに参加
    //socket.join(data.roomId);
    // ルームに参加したことを通知
    //this.server.to(data.roomId).emit('joinedRoom', data.userId);

    console.log('playStart');
    if (this.isPlayingUserId(data.userId)) {
      return false;
    }

    // キューから対戦相手を取得
    // キューにいるプレイヤーを取得　先頭
    const waitingUserIdx = this.waitingQueue.findIndex((player) => player.id !== data.userId);

    // 誰もいない場合、自分を追加
    if (waitingUserIdx === -1) {
      const user = await this.usersService.findOne(data.userId);
      if (user === undefined) {
        return false;
      }
      this.waitingQueue.push({
        name: user.userName,
        id: data.userId,
        point: user.point,
        socket: socket,
        height: GameGateway.initialHeight,
        score: 0,
      });
      return true;
    // 待機プレイヤーがいる場合
    } else {
      const user = await this.usersService.findOne(data.userId);
      if (user === undefined) {
        return false;
      }

      // 対戦相手
      const player1 = this.waitingQueue.splice(waitingUserIdx, 1)[0];

      // 自分
      const player2 = {
        name: user.userName,
        id: data.userId,
        point: user.point,
        socket: socket,
        height: GameGateway.initialHeight,
        score: 0,
      };
      void this.startGame(player1, player2, 'random')
    }

    return true;
  }

  // ゲームを初期化して開始
  async startGame(player1: Player, player2: Player2, gameType: string) {
    const roomName = uuidv4();
  
    this.logger.log(`startGame: ${player1.id} vs ${player2.id}`);
    this.logger.log(`startGame: ${player1.name} vs ${player2.name}`);

    // Playingに更新
    this.addPlayingUserId(player1.id);
    this.addPlayingUserId(player2.id);

    await player1.socket.join(roomName);
    await player2.socket.join(roomName);
 
    // まとめる
    const ball: Ball = {
      x: GameGateway.ballInitialX,
      y: GameGateway.ballInitialY,
      radius: GameGateway.ballRadius,
    };

    const ballVec: BallVec = {
      xVec: GameGateway.ballInitialXVec,
      yVec: this.setBallVec(),
      speed: GameGateway.ballSpeed,
    };

    const newRoom: RoomInfo = {
      roomName: roomName,
      player1: player1,
      player2: player2,
      supporters: [],
      ball: ball,
      ballVec: ballVec,
      isPlayer1Turn: true,
      gameSetting: GameGateway.defaultSetting,
      barLength: GameGateway.barLength,
      barSpeed: GameGateway.barSpeed,
      initialHeight: GameGateway.initialHeight, 
      lowestPosition: GameGateway.lowestPos,
      rewards: 0,
      gameState: GameState.PLAYING,
    };

    this.gameRooms.push(newRoom);

    this.updatePlayerStatus(player1, player2, gameType);
  }
}

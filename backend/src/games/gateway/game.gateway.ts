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

  // バーの初期位置
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
  // heighestPos, lowestPos ボールの移動範囲　上下
  static heighestPos = 10;
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
      const supporterId = this.getIdFromSocket(supporter);
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

    // friendがプロフィール見ていれば、表示される
    // client側でupdateStatusを受け取るようにする
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
    console.log(this.waitingQueue)
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

      console.log(this.waitingQueue)

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

    console.log(this.waitingQueue)


    return true;
  }

  // ゲームを初期化して開始
  async startGame(player1: Player, player2: Player, gameType: string) {
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

    // ゲームセッティング完了
    @SubscribeMessage('compleateSetting')
    playGame(@ConnectedSocket() socket: Socket, @MessageBody() data: PlayGameDto) {
      console.log(this.gameRooms)
      console.log(socket.id)
      const room = this.gameRooms.find((room) => 
        room.player1.socket.id === socket.id || room.player2.socket.id === socket.id,
      );

      console.log(room)
      if (!room) {
        console.log('error');
        socket.emit('error');
        const id = this.getIdFromSocket(socket);
        this.removePlayingUserId(id);
      } else {
        this.logger.log(`compleateSetting`, data);
        // ゲーム設定の更新
        room.gameSetting = data as GameSetting;
        room.rewards = data.matchPoint * 10;
  
        // TDDO:
        // ball speedも変更
        switch (data.difficulty) {
          case DiffucultyLevel.NORMAL:
            room.barLength = GameGateway.boardHeight / Normal;
             break;
          case DiffucultyLevel.HARD:
            room.barLength = GameGateway.boardHeight / Hard;
            room.rewards *= 2;
            break;
          default:
            room.barLength = GameGateway.boardHeight / Easy;
            room.rewards /= 2;
            break;
        }
  
        //?
        room.initialHeight = GameGateway.initialHeight / 2 - room.barLength / 2;
        //?
        room.lowestPosition = GameGateway.boardHeight - GameGateway.heighestPos - room.barLength;
        room.player1.height = room.initialHeight;
        room.player2.height = room.initialHeight;
        room.gameState = GameState.PLAYING;
  
        // 設定を送信
        this.server.to(room.roomName).emit('playStarted', data as GameSetting);
      }
    }

  // マッチングのキャンセル
  @SubscribeMessage('playCancel')
  cancelMatching(@ConnectedSocket() socket: Socket) {
    console.log('playCancel');
    this.waitingQueue = this.waitingQueue.filter((player) => player.socket.id !== socket.id);
  }

  // バーの移動
  @SubscribeMessage('barMove')
  async updatePlayerPos(@ConnectedSocket() socket: Socket, @MessageBody() data: UpdatePlayerPosDto) {
    console.log('barMove');
    let isGameOver = false;

    const room = this.gameRooms.find((room) => 
      room.player1.socket.id === socket.id || room.player2.socket.id === socket.id || room.supporters.find((s) => s.id === socket.id)
    );
    // 存在しない場合
    if (!room) {
      socket.emit('error');
      const id = this.getIdFromSocket(socket);
      // プレイ中のユーザーから削除
      this.removePlayingUserId(id);
      return ;
    }

    // サポーターの場合
    if (room.player1.socket.id !== socket.id && room.player2.socket.id !== socket.id) {
      this.sendGameInfo(room);
      return ;
    }

    // プレイヤーを判定
    const player = room.player1.socket.id === socket.id ? room.player1 : room.player2;
    const ball = room.ball;
    const ballVec = room.ballVec;

    // playerの位置を更新
    const updatedHeight = player.height + (data.move * room.barSpeed);
    // 上限下限の場合はストップ
    if (updatedHeight < GameGateway.heighestPos) {
      player.height = GameGateway.heighestPos;
      // TODO: lowestPosにする
    } else if (room.lowestPosition < updatedHeight) {
      player.height = room.lowestPosition;
    } else {
      player.height = updatedHeight;
    }

    // ボールの移動
    // 上限下限の場合は反転
    if ((ballVec.yVec < 0 && ball.y < GameGateway.heighestPos) || (0 < ballVec.yVec && room.lowestPosition + room.barLength < ball.y)) {
      ballVec.yVec *= -1;
    }

    if (ball.x < GameGateway.leftEnd) {
      // 左に向いていて、player1のバーの範囲内の場合
      if (ballVec.xVec < 0 && room.player1.height <= ball.y && ball.y <= room.player1.height + room.barLength) {
        // 反転
        ballVec.xVec = 1;
        // ? 反転
        ballVec.yVec = ((ball.y - (room.player1.height + room.barLength / 2)) * 2) / room.barLength;
      } else {
        // ゲーム終了
        isGameOver = true;
        room.player1.score++;
      } 
    } else if (GameGateway.rightEnd < ball.x) {
        if (0 < ballVec.xVec && room.player2.height <= ball.y && ball.y <= room.player2.height + room.barLength) {
          ballVec.xVec = -1;
          ballVec.yVec = ((ball.y - (room.player2.height + room.barLength / 2)) * 2) / room.barLength;
        } else {
          isGameOver = true;
          room.player2.score++;
        }
    } 

    // ボールの移動の更新
    if (!isGameOver) {
      ball.x += ballVec.xVec * ballVec.speed;
      ball.y += ballVec.yVec * ballVec.speed;
    // ゲーム終了の場合、初期位置に戻す
    } else {
      ball.x = GameGateway.ballInitialX;
      ball.y = GameGateway.ballInitialY;
      // ボールの方向をランダムに設定
      ballVec.xVec = room.isPlayer1Turn ? 1: -1;
      ballVec.yVec = this.setBallVec();
      room.isPlayer1Turn = !room.isPlayer1Turn;

      // ゲーム終了の場合、ポイントを更新
      if (room.gameSetting.matchPoint === room.player1.score) {
        await this.finishGame(room, room.player1, room.player2);
      } else if (room.gameSetting.matchPoint === room.player2.score) {
        await this.finishGame(room, room.player2, room.player1);
      } else {
        // ポイントを更新
        this.server.to(room.roomName).emit('updateScores', [room.player1.score, room.player2.score]);
        room.gameSetting.player1Score = room.player1.score;
        room.gameSetting.player2Score = room.player2.score;
      }
    }
    this.sendGameInfo(room);
  }

  // playerとballの情報を更新
  sendGameInfo(room: RoomInfo) {
    const gameInfo: GameInfo = {
      height1: room.player1.height,
      height2: room.player2.height,
      ball: room.ball,
    }
    // ルームの参加者に送信
    this.server.to(room.roomName).emit('updateGameInfo', gameInfo);
  }

  // ゲーム終了
  async finishGame(room: RoomInfo, winner: Player, loser: Player) {
    const finishedGameInfo: FinishedGameInfo = {
      winnerName: winner.name,
      loserName: loser.name,
      winnerScore: winner.score,
      loserScore: loser.score,
    };

    room.supporters.map((supporter) => {
      // null はscore
      supporter.emit('finishGame', null, finishedGameInfo);
    });

    // ポイントを更新
    winner.socket.emit('finishGame', winner.score + room.rewards, finishedGameInfo);

    // ポイントを更新
    loser.socket.emit('finishGame', Math.max(loser.score - room.rewards, 0), finishedGameInfo);

    await this.recordsRepository.createGameRecord({
      winnerId: winner.id,
      loserId: loser.id,
      winnerScore: winner.score,
      loserScore: loser.score,
    });

    // プレイ中のユーザーから削除 roomメンバー全て
    this.removePlayingUsersFromRoom(room);

    // roomを削除
    this.gameRooms = this.gameRooms.filter((r) => r.roomName !== room.roomName);
  }

  // 開始中のゲームをキャンセル
  @SubscribeMessage('cancelOngoingBattle')
  cancelGame(@ConnectedSocket() socket: Socket) {
    const room = this.gameRooms.find((room) => {
      room.player1.socket.id === socket.id || room.player2.socket.id === socket.id
    });
    if (!room) {
      socket.emit('error');
      // プレイ中のユーザーから削除
      const id = this.getIdFromSocket(socket);
      this.removePlayingUserId(id);
    } else {
      // キャンセルをクライアントに通知
      this.server.to(room.roomName).emit('cancelOngoingBattle');
      this.gameRooms = this.gameRooms.filter((room) => room.player1.socket.id !== socket.id && room.player2.socket.id !== socket.id);
      // プレイ中のユーザーから削除
      this.removePlayingUsersFromRoom(room);
    }
  }
}

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS_GAME } from '../game.constant';

type GameRoomConnectionDto = {
  roomId: string;
  userId: string;
};

// 接続者情報
type ConnectedUser = {
  client: Socket;
  userId: string;
};

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway {
  @WebSocketServer()
  server: Server;

  private rooms: { [roomId: string]: ConnectedUser[] } = {};

  // ユーザーの入室処理
  @SubscribeMessage('joinGameRoom')
  async handleJoinRoom(
    @MessageBody() data: GameRoomConnectionDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Client ${client.id} joined room: ${data.roomId}`);
    if (!this.rooms[data.roomId]) {
      this.rooms[data.roomId] = [];
    }
    this.rooms[data.roomId].push({ client: client, userId: data.userId });

    await client.join(data.roomId);

    // ルームが規定人数に達した場合、ゲーム開始通知を送信
    if (this.rooms[data.roomId].length === 2) {
      this.server.to(data.roomId).emit(SOCKET_EVENTS_GAME.START_GAME, 'Game is starting');
    }

    // ルームの参加者情報を更新
    this.server
      .to(data.roomId)
      .emit(
        SOCKET_EVENTS_GAME.USERS_IN_ROOM,
        this.rooms[data.roomId]?.map((client) => client.userId),
      );
  }

  @SubscribeMessage('getGameEntries')
  handleGetEntries(@MessageBody() data: GameRoomConnectionDto, @ConnectedSocket() client: Socket) {
    const userIds = this.rooms[data.roomId]?.map((client) => client.userId) || [];
    client.emit('usersInRoom', userIds);
  }

  afterInit(_client: Server) {
    console.log('Init');
  }

  handleConnection(socket: Socket) {
    socket.emit('message', 'Welcome to the game room');
  }

  handleDisconnect(client: Socket) {
    // ルームからクライアントを削除
    let roomIdToDelete: string | undefined;
    for (const [roomId, users] of Object.entries(this.rooms)) {
      const index = users.findIndex((user) => user.client.id === client.id);
      if (index !== -1) {
        users.splice(index, 1); // クライアントをルームから削除
        roomIdToDelete = roomId;
        if (users.length === 0) {
          delete this.rooms[roomId]; // ルームが空になったら削除
        }
        break;
      }
    }
    if (roomIdToDelete) {
      this.server.to(roomIdToDelete).emit('playerLeft', `${client.id} left the room`);
      // ルームの参加者が1人だけになった場合、ゲームを中止するなどの処理をここに追加
      if (this.rooms[roomIdToDelete] && this.rooms[roomIdToDelete].length === 1) {
        this.server
          .to(roomIdToDelete)
          .emit('gameStopped', 'The game has stopped because a player left');
      }
    }
    // ルームの参加者情報を更新
    this.server
      .to(roomIdToDelete)
      .emit(
        SOCKET_EVENTS_GAME.USERS_IN_ROOM,
        this.rooms[roomIdToDelete]?.map((client) => client.userId),
      );
  }
}

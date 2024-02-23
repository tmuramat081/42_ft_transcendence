import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type GameRoomConnectionDto = {
  roomId: string;
  userId: string;
};

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('Gateway Log');
  private rooms: { [roomId: string]: Socket[] } = {};

  // ユーザーの入室処理
  @SubscribeMessage('join')
  async handleJoinRoom(
    @MessageBody() data: GameRoomConnectionDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Client ${client.id} joined room: ${data.roomId}`);
    if (!this.rooms[data.roomId]) {
      this.rooms[data.roomId] = [];
    }
    this.rooms[data.roomId].push(client);

    if (this.rooms[data.roomId].length === 2) {
      console.log('Game is starting', client.id);
      this.server.to(data.roomId).emit('startGame', 'Game is starting');
    }
    await client.join(data.roomId);
  }

  @SubscribeMessage('getEntries')
  handleGetEntries(@MessageBody() data: GameRoomConnectionDto, @ConnectedSocket() client: Socket) {
    const users = this.rooms[data.roomId]?.map((user) => user.id) || [];
    client.emit('usersInRoom', users);
  }

  afterInit(_client: Server) {
    console.log('Init');
  }

  handleConnection(socket: Socket) {
    console.log('New client connected');
    socket.emit('message', 'Welcome to the game room');
  }

  handleDisconnect(client: Socket) {
    // remove client from room
    let roomIdToDelete: string | undefined;
    for (const [roomId, clients] of Object.entries(this.rooms)) {
      const index = clients.findIndex((c) => c.id === client.id);
      if (index !== -1) {
        clients.splice(index, 1); // クライアントをルームから削除
        roomIdToDelete = roomId;
        if (clients.length === 0) {
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
    console.log('Client disconnected', roomIdToDelete);
  }
}

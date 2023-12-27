import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('Gateway Log');
  private rooms: { [key: string]: { messages: string[] } } = {};

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() { roomID, text }: { roomID: string; text: string },
  ) {
    this.logger.log(`message received: ${text}`);
    this.rooms[roomID].messages.push(text);
    this.server.to(roomID).emit('update', text);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() roomID: string) {
    this.logger.log(`joining room: ${roomID}`);
    if (!this.rooms[roomID]) {
      this.rooms[roomID] = { messages: [] };
    }
    this.server.socketsJoin(roomID);
    this.server.to(roomID).emit('update', 'Joined the room');
  }

  @SubscribeMessage('getMessages')
  handleGetMessages(@MessageBody() roomID: string) {
    return this.rooms[roomID]?.messages || [];
  }
}

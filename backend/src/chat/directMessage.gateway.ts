import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { DirectMessage } from './entities/directMessage.entity'; // ダイレクトメッセージのエンティティ

@WebSocketGateway()
export class DirectMessageGateway {
  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('DirectMessageGateway');

  // クライアントからのメッセージを受信するハンドラー
  @SubscribeMessage('sendDM')
  handleDirectMessage(client: Socket, payload: DirectMessage): void {
    this.logger.log(
      `Received DM from ${payload.sender} to ${payload.recipient}: ${payload.message}`,
    );

    // 受信したメッセージを他のクライアントに送信する
    this.server.to(payload.recipient).emit('updateDM', payload);
  }
}

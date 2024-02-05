import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { ChatLog } from './entities/chatlog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, ChatLog])],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}

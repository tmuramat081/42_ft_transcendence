import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { RoomRepository } from './room.repository';
import { ChatLogRepository } from './chatlog.repository';
import { Room } from './entities/room.entity';
import { ChatLog } from './entities/chatlog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, ChatLog])],
  providers: [ChatGateway, RoomRepository, ChatLogRepository],
})
export class ChatModule {}

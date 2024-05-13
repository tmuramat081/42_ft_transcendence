import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { DMGateway } from './directMessage.gateway';
import { RoomGateway } from './room.gateway';
import { Room } from './entities/room.entity';
import { ChatLog } from './entities/chatLog.entity';
import { User } from '../users/entities/user.entity';
import { DmLog } from './entities/dmLog.entity';
import { OnlineUsers } from './entities/onlineUsers.entity';
import { GameRoom } from '../games/entities/gameRoom.entity';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, ChatLog, User, DmLog, OnlineUsers, GameRoom]),
    UsersModule,
  ],
  providers: [ChatGateway, DMGateway, RoomGateway],
})
export class ChatModule {}

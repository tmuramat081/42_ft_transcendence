import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { DMGateway } from './directMessage.gateway';
import { Room } from './entities/room.entity';
import { ChatLog } from './entities/chatLog.entity';
import { User } from '../users/entities/user.entity';
import { DmLog } from './entities/dmLog.entity';
import { OnlineUsers } from './entities/onlineUsers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, ChatLog, User, DmLog, OnlineUsers])],
  providers: [ChatGateway, DMGateway],
})
export class ChatModule {}

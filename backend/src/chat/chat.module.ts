import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { Room } from './entities/room.entity';
import { ChatLog } from './entities/chatlog.entity';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from './entities/currentUser.entity';
import { DirectMessage } from './entities/directMessage.entity';
import { OnlineUsers } from './entities/onlineUsers.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, ChatLog, User, CurrentUser, DirectMessage, OnlineUsers]),
  ],
  providers: [ChatGateway],
})
export class ChatModule {}

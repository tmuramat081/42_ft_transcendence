import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { Room } from './entities/room.entity';
import { ChatLog } from './entities/chatlog.entity';
import { User } from '../users/entities/user.entity';
import { DM_User } from './entities/dm-user.entity';
import { DirectMessage } from './entities/direct-message.entity';
import { OnlineUsers } from './entities/online-users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, ChatLog, User, DM_User, DirectMessage, OnlineUsers])],
  providers: [ChatGateway],
})
export class ChatModule {}

import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [UsersModule, ChatModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

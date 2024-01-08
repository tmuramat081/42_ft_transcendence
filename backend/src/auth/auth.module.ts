import { HttpModule } from '@nestjs/axios'
import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IntraAuthGuard } from './guards/auth.guards';
import { IntraStrategy } from './strategy/auth.strategy';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { UserRepository } from '../users/users.repository';

// mfnyu 15, 16
// 11はスクラッチで実装してみる

@Module({
  //forwardRefは循環参照を解決するために使われる
  imports:[forwardRef(() => UsersModule), HttpModule],
  controllers: [AuthController],
  providers: [AuthService, UsersService, IntraStrategy, IntraAuthGuard],
})
export class AuthModule {}

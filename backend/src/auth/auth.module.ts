/* eslint-disable */
import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IntraAuthGuard } from './guards/42auth.guards';
import { IntraStrategy } from './strategy/42auth.strategy';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { UserRepository } from '../users/users.repository';
import { TwoFactorAuthGuard } from './guards/2fa-auth.guards';
import { TwoFactorAuthStrategy } from './strategy/2fa.strategy';

@Module({
  //forwardRefは循環参照を解決するために使われる
  // imports: [forwardRef(() => UsersModule), HttpModule],
  imports: [UsersModule, HttpModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    IntraStrategy,
    IntraAuthGuard,
    TwoFactorAuthGuard,
    TwoFactorAuthStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}

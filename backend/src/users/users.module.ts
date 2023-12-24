import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './users.repository';

@Module({
  // DBのテーブルを使うためには、forFeature()を使う
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UserRepository, UsersService],
})
export class UsersModule {}

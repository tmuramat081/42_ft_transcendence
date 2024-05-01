import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import 'reflect-metadata';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './games/games.module';
import { User } from './users/entities/user.entity';
import { GameRoom } from './games/entities/gameRoom.entity';
import { GameEntry } from './games/entities/gameEntry.entity';
import { MatchResult } from './games/entities/matchResult.entity';
import { Match } from './games/entities/match.entity';
import { Room } from './chat/entities/room.entity';
import { ChatLog } from './chat/entities/chatLog.entity';
import { OnlineUsers } from './chat/entities/onlineUsers.entity';
import { DmLog } from './chat/entities/dmLog.entity';
import { UserBlock } from './chat/entities/userBlock.entity';
import { BlockedUser } from './chat/entities/blockedUser.entity';
import { GameRecord } from './games/entities/gameRecord.entity';

// .envを読み込む
dotenv.config();
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
      //バリデーション
      //required()は必須項目
      validationSchema: Joi.object({
        POSTGRESS_HOST: Joi.string().required(),
        POSTGRESS_PORT: Joi.number().required(),
        POSTGRESS_USER: Joi.string().required(),
        POSTGRESS_PASSWORD: Joi.string().required(),
        POSTGRESS_DB: Joi.string().required(),
      }),
    }),
    // forRootAsync()を使って非同期接続
    TypeOrmModule.forRootAsync({
      imports: [
        TypeOrmModule.forFeature([
          Room,
          ChatLog,
          OnlineUsers,
          DmLog,
          UserBlock,
          BlockedUser,
          User,
          GameRoom,
          GameEntry,
          MatchResult,
          Match,
          GameRecord,
        ]),
        ConfigModule,
      ],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRESS_HOST'),
        port: config.get<number>('POSTGRESS_PORT'),
        username: config.get<string>('POSTGRESS_USER'),
        password: config.get<string>('POSTGRESS_PASSWORD'),
        database: config.get<string>('POSTGRESS_DB'),
        entities: [
          User,
          Room,
          ChatLog,
          OnlineUsers,
          DmLog,
          UserBlock,
          BlockedUser,
          GameRoom,
          GameEntry,
          MatchResult,
          Match,
          GameRecord,
        ], // 直接エンティティを指定
        synchronize: true,
        ssl: false,
      }),
    }),
    UsersModule,
    AuthModule,
    ChatModule,
    GameModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

// for development
console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);

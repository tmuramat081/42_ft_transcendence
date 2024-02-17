import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
// import { ChatGateway } from './chat/chat.gateway';
import { Room } from './chat/entities/room.entity';
import { GameModule } from './games/games.module';
import { User } from './users/entities/user.entity';
import { GameRoom } from './games/entities/gameRoom.entity';
import { GameEntry } from './games/entities/gameEntry.entity';
import { MatchResult } from './games/entities/matchResult.entity';
import { Match } from './games/entities/match.entity';
import { ChatLog } from './chat/entities/chatlog.entity';
// import { ChatLogRepository } from './chat/chatlog.repository'; // 追加
// import { RoomRepository } from './chat/room.repository'; // 追加

// .envを読み込む
dotenv.config();
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
      imports: [TypeOrmModule.forFeature([Room, ChatLog]), ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRESS_HOST'),
        port: config.get<number>('POSTGRESS_PORT'),
        username: config.get<string>('POSTGRESS_USER'),
        password: config.get<string>('POSTGRESS_PASSWORD'),
        database: config.get<string>('POSTGRESS_DB'),
        entities: [Room, User, ChatLog, GameRoom, GameEntry, MatchResult, Match], // 直接エンティティを指定
        synchronize: true,
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

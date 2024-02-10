import { Module } from '@nestjs/common';
//
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './games/games.module';

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
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRESS_HOST'),
        port: config.get<number>('POSTGRESS_PORT'),
        username: config.get<string>('POSTGRESS_USER'),
        password: config.get<string>('POSTGRESS_PASSWORD'),
        database: config.get<string>('POSTGRESS_DB'),
        entities: [__dirname + '/../**/*.entity.{js,ts}'],
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

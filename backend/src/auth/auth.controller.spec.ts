import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios'
import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IntraAuthGuard } from './guards/auth.guards';
import { IntraStrategy } from './strategy/auth.strategy';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';

// import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '../users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv'; 
import * as Joi from 'joi';


dotenv.config();
describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      //forwardRefは循環参照を解決するために使われる
      imports:[
        forwardRef(() => UsersModule), HttpModule,
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
          useFactory: async (config: ConfigService) => ({
            type: 'postgres',
            host: config.get<string>('POSTGRESS_HOST'),
            port: config.get<number>('POSTGRESS_PORT'),
            username: config.get<string>('POSTGRESS_USER'),
            password: config.get<string>('POSTGRESS_PASSWORD'),
            database: config.get<string>('POSTGRESS_DB'),
            entities: [User],
            synchronize: true,
          }),
        }),
        TypeOrmModule.forFeature([User]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        // JWTの設定
        JwtModule.register({
          // JWTの署名に使う秘密鍵
          // 本来は環境変数などで管理する
          secret: 'secretKey123',
          // トークンの有効期限
          signOptions: {
            expiresIn: 3600,
          },
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService, UsersService, IntraStrategy, IntraAuthGuard],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

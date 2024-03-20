import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IntraAuthGuard } from './guards/42auth.guards';
import { IntraStrategy } from './strategy/42auth.strategy';
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

const mockUserRepository = () => ({
  createUser: jest.fn(),
  signUp: jest.fn(),
  signIn: jest.fn(),
  findAll: jest.fn(),
  //findOne: jest.fn().mockResolvedValue(mockUser1), // モックの戻り値を設定
  findOneByName: jest.fn(), 
  sign: jest.fn(),
  saveUser: jest.fn(),
  addFriend: jest.fn(),
  removeFriend: jest.fn(),
  getFriends: jest.fn(),
  blockUser: jest.fn(),
  unblockUser: jest.fn(),
  getBlockedUsers: jest.fn(),
});

dotenv.config();
describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      //forwardRefは循環参照を解決するために使われる
      imports: [
        // forwardRef(() => UsersModule),
        // HttpModule,
        // ConfigModule.forRoot({
        //   isGlobal: true,
        //   envFilePath: '.env',
        //   //バリデーション
        //   //required()は必須項目
        //   validationSchema: Joi.object({
        //     POSTGRESS_HOST: Joi.string().required(),
        //     POSTGRESS_PORT: Joi.number().required(),
        //     POSTGRESS_USER: Joi.string().required(),
        //     POSTGRESS_PASSWORD: Joi.string().required(),
        //     POSTGRESS_DB: Joi.string().required(),
        //   }),
        // }),
        // // forRootAsync()を使って非同期接続
        // TypeOrmModule.forRootAsync({
        //   imports: [ConfigModule],
        //   inject: [ConfigService],
        //   useFactory: (config: ConfigService) => ({
        //     type: 'postgres',
        //     host: config.get<string>('POSTGRESS_HOST'),
        //     port: config.get<number>('POSTGRESS_PORT'),
        //     username: config.get<string>('POSTGRESS_USER'),
        //     password: config.get<string>('POSTGRESS_PASSWORD'),
        //     database: config.get<string>('POSTGRESS_DB'),
        //     entities: [__dirname + '/../**/*.entity.{js,ts}'],
        //     synchronize: true,
        //   }),
        // }),
        // TypeOrmModule.forFeature([User]),
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
      providers: [
        IntraStrategy, 
        IntraAuthGuard,
        { provide: UsersService, useValue: mockUserRepository },
        { provide: AuthService, useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // verify2fa

  // generate2faSecret

  // generate2faQRCode

  // disable2fa
});

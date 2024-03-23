/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
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
import { JwtService } from '@nestjs/jwt';


const mockUser1: User = {
  userId: 1,
  userName: 'test',
  email: 'test@test',
  password: 'test',
  icon: '',
  createdAt: new Date('2023-01-01T00:00:00Z'),
  deletedAt: new Date('2023-01-01T00:00:00Z'),
  name42: '',
  twoFactorAuth: false,
  twoFactorAuthSecret: '',
  friends: [],
  blocked: [],
  gameRooms: [],
  matchResults: [],
  gameEntries: [],
  matchesAsPlayer1: [],
  matchesAsPlayer2: [],
};

const mockAuthService = () => ({
  signUp: jest.fn(),
  signIn: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findOneByName: jest.fn(),
  currentUser: jest.fn(),
  generateJwt: jest.fn(),
});

dotenv.config();
describe('AuthController', () => {
  let controller: AuthController;
  let module: TestingModule;
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;


  beforeEach(async () => {
    module = await Test.createTestingModule({
      //forwardRefは循環参照を解決するために使われる
      imports: [
        //forwardRef(() => UsersModule),
        HttpModule,
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
        //   useFactory: async (config: ConfigService) => ({
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
      //AuthService, UsersService, 
      providers: [
        IntraStrategy, 
        IntraAuthGuard, 
        JwtService,
        { provide: AuthService, useFactory: mockAuthService },
        { provide: UsersService, useFactory: mockAuthService },
      ],
      exports: [IntraStrategy, IntraAuthGuard],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

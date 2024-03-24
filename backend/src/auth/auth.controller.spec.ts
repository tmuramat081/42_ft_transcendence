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
import { JwtStrategy } from '../users/strategy/jwt.strategy';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';

import { Validate2FACodeDto } from './dto/2fa';
import { Response } from 'express';
import { UserRepository } from '../users/users.repository';


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
  validateUser: jest.fn(),
  verify2fa: jest.fn(),
  disable2fa: jest.fn(),
  get2faCode: jest.fn(),
  generate2faAuthSecret: jest.fn(),
  generate2faQrCode: jest.fn(),
});

dotenv.config();
describe('AuthController', () => {
  let controller: AuthController;
  let module: TestingModule;
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let userRepository: UserRepository;


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
        JwtAuthGuard,
        JwtStrategy,
        { provide: AuthService, useFactory: mockAuthService },
        { provide: UsersService, useFactory: mockAuthService },
        { provide: UserRepository, useFactory: mockAuthService}, 
      ],
      exports: [IntraStrategy, IntraAuthGuard],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // callback42
  // redirectのテストは難しい
  // describe('callback42', () => {
  //   it('should return a user', async () => {
  //     const mockRequest = {
  //       user: {
  //         userId: mockUser1.userId,
  //         userName: mockUser1.userName,
  //         email: mockUser1.email,
  //         password: mockUser1.password,
  //         passwordConfirm: mockUser1.password,
  //       },
  //     };

  //     const mockResponse = {
  //       status: jest.fn().mockReturnThis(),
  //       json: jest.fn().mockReturnThis(),
  //       send: jest.fn().mockReturnThis(),
  //       cookie: jest.fn().mockReturnThis(),
  //       // 他に必要なメソッドをモック化
  //     } as unknown as Response;
      
  //     const expectedResult = { userId: undefined, status: 'SUCCESS' };
  //     const result = await controller.callback42(mockRequest, mockResponse);

  //     expect(result).toEqual(expectedResult);
  //   });
  // });


  // login42
  describe('login42', () => {
    it('should return a user', async () => {
      const mockAccessToken = 'fake_access_token';
      const mockPayload = {
        email: 'test@example.com',
        userName: 'testUser',
        icon: 'testIcon',
      };

      const mockRequest = {
        cookies: {
          'login42': mockAccessToken,
        },
        user: {
          userId: mockUser1.userId,
          userName: mockUser1.userName,
          email: mockUser1.email,
          password: mockUser1.password,
          passwordConfirm: mockUser1.password,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
        clearCookie: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // jwtServiceのモック
      jest.spyOn(jwtService, 'decode').mockReturnValue(mockPayload);
      jest.spyOn(jwtService, 'sign').mockReturnValue('new_access_token');

      // authServiceのモック
      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser1);

      const expectedResult = { userId: undefined, status: 'SUCCESS' };
      const result = await controller.login42(mockRequest, mockResponse);

      expect(result).toEqual(expectedResult);
      // expect(mockResponse.cookie).toHaveBeenCalledWith('jwt', 'new_access_token', { httpOnly: true });
      // expect(mockResponse.clearCookie).toHaveBeenCalledWith('login42');
    });
  });

  // verify2fa
  describe('verify2fa', () => {
    it('should return true if the code is correct', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser1);
      jest.spyOn(authService, 'verify2fa').mockResolvedValue(true);
      jest.spyOn(usersService, 'generateJwt').mockResolvedValue('token');

      const mockRequest = {
        user: {
          userId: mockUser1.userId,
          userName: mockUser1.userName,
          email: mockUser1.email,
          password: mockUser1.password,
          passwordConfirm: mockUser1.password,
        },
      };

      const mockDto: Validate2FACodeDto = {
        userId: mockUser1.userId,
        code: '123456',
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
        clearCookie: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const expectedResult = '{\"accessToken\":\"token\"}';

      const result = await controller.verify2fa(mockDto, mockRequest, mockResponse);

      expect(result).toEqual(expectedResult);
    });
  });


  // disable2fa
  describe('disable2fa', () => {
    it('should return a user with twoFactorAuth set to false', async () => {
      jest.spyOn(authService, 'disable2fa').mockResolvedValue(mockUser1);
      
      const mockRequest = {
        user: {
          userId: mockUser1.userId,
          userName: mockUser1.userName,
          email: mockUser1.email,
          password: mockUser1.password,
          passwordConfirm: mockUser1.password,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
        clearCookie: jest.fn().mockReturnThis(),
      } as unknown as Response;

      //const expectedResult = mockUser1;

      const expectedResult = '{\"message\":\"2fa disabled\"}';

      const result = await controller.disable2fa(mockRequest, mockResponse);

      expect(result).toEqual(expectedResult);
    });
  });


  // get2faCode
  describe('get2faCode', () => {
    it('should return a QR code', async () => {
      jest.spyOn(authService, 'generate2faAuthSecret').mockResolvedValue('QR code');
      jest.spyOn(authService, 'generate2faQrCode').mockResolvedValue('QR code');

      const mockRequest = {
        user: {
          userId: mockUser1.userId,
          userName: mockUser1.userName,
          email: mockUser1.email,
          password: mockUser1.password,
          passwordConfirm: mockUser1.password,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
        clearCookie: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const expectedResult = '{\"qrCord\":\"QR code\"}';

      const result = await controller.get2faCode(mockRequest);

      expect(result).toEqual(expectedResult);
    });
  });
});

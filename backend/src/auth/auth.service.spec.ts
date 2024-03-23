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
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '../users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import { JwtAuthGuard } from '@/users/guards/jwt-auth.guard';
import { JwtStrategy } from '@/users/strategy/jwt.strategy';

import { UserRepository } from '../users/users.repository';
import * as QRCode from 'qrcode';
import * as speakeasy from 'speakeasy';

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

const mockUserRepository = () => ({
  createUser: jest.fn(),
  signUp: jest.fn(),
  signIn: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(), // モックの戻り値を設定
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
  updateUser2faSecret: jest.fn(),
  updateUser2fa: jest.fn(),

});

jest.mock('speakeasy', () => ({
  generateSecret: jest.fn().mockImplementation(() => ({
    base32: 'NVZVKZTUFBUVCY3GIFJEI3TCJZAEWQ3Y',
  })),
  otpauthURL: jest.fn().mockImplementation(() => 'otpauth://totp/test?secret=JZPG4QK5OAYWQMTTJVBU6RZUORNE2XTW&issuer=ft_transcendence'),
}));

dotenv.config();
describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let module: TestingModule;
  let userRepository: UserRepository;

  beforeEach(async () => {
    module = await Test.createTestingModule({
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
        AuthService,
        JwtAuthGuard,
        JwtStrategy,
        { provide: UsersService, useFactory: mockUserRepository },
        { provide: UserRepository, useFactory: mockUserRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<UserRepository>(UserRepository);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // one time passwordがうまくモック できない
  // speakasyのモックができない

  verify2fa
  describe('verify2fa', () => {
    it('should return true if the code is correct', async () => {
      const expected = true;
      const code = '123456';
      const userId = 1;
      const user = mockUser1;

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      const result = await service.verify2fa(userId, code);
      expect(result).toEqual(expected);
    });
  });

  //generate2faSecret
  describe('generate2faSecret', () => {
    it('should return a secret', async () => {
      const expected = 'otpauth://totp/test?secret=JZPG4QK5OAYWQMTTJVBU6RZUORNE2XTW&issuer=ft_transcendence';
      const user = mockUser1;

      //jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(usersService, 'updateUser2faSecret').mockResolvedValue(user);

      const result = await service.generate2faAuthSecret(user);

      expect(result).toEqual(expected);
    });
  });

  // generate2faQRCode
  // describe('generate2faQRCode', () => {
  //   it('should return a QR code', async () => {
  //     const expected = 'QR code';
  //     const user = mockUser1;
  //     const result = await service.generate2faQrCode("test");
      
  //     expect(result).toEqual(expected);
  //   });
  // });

  // disable2fa
  describe('disable2fa', () => {
    it('should return a user with twoFactorAuth set to false', async () => {
      const expected = mockUser1;
      expected.twoFactorAuth = false;
      const user = mockUser1;
      const result = await service.disable2fa(user);

      jest.spyOn(usersService, 'updateUser2fa').mockResolvedValue(expected);

      expect(result).toEqual(expected);
    });
  });
});

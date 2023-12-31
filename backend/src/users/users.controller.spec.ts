import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
// import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './users.repository';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtPayload } from './interfaces/jwt_payload';
import { JwtService } from '@nestjs/jwt'
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv'; 
import * as Joi from 'joi';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Timestamp, Unique } from "typeorm";
import { Response } from 'express';


dotenv.config();
const mockUser1: User = {
  userId: 1,
  userName: "test",
  email: "test@test",
  password: "test",
  icon: "",
  createdAt: new Date('2023-01-01T00:00:00Z'),
  deletedAt: new Date('2023-01-01T00:00:00Z'),
  name42: "",
  twoFactorAuth: false,
  twoFactorAuthSecret: "",
};

// serviceをモックする
const mockUsersService = () => ({
  signUp: jest.fn(),
  signIn: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findOneByName: jest.fn(),
});

dotenv.config();
describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // controllers: [UsersController],
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
      controllers: [UsersController],
      providers: [UserRepository, JwtStrategy, JwtAuthGuard, { provide: UsersService, useFactory: mockUsersService }],
      exports: [JwtStrategy, JwtAuthGuard],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should return a jwt token', async () => {
      const result = 'testToken';
      const userDto = {
        userId: 1,
        userName: 'testUser',
        email: 'test@test.com',
        password: 'testPassword',
        passwordConfirm: 'testPassword',
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
        // 他に必要なメソッドをモック化
      } as unknown as Response;

      jest.spyOn(service, 'signUp').mockImplementation(async () => result);

      expect(await controller.SignUp(userDto, mockResponse)).toBe("{\"accessToken\":\"testToken\"}");
    }); 
  }); 

  describe('signIn', () => {
    it('should return a jwt token', async () => {
      const result = 'testToken';
      const userDto = {
        userId: 1,
        userName: 'testUser',
        email: 'test@test.com',
        password: 'testPassword',
        passwordConfirm: 'testPassword',
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
        // 他に必要なメソッドをモック化
      } as unknown as Response;

      jest.spyOn(service, 'signIn').mockImplementation(async () => result);

      expect(await controller.SignIn(userDto, mockResponse)).toBe("{\"accessToken\":\"testToken\"}");
    }); 
  }); 
});

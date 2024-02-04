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
import { SignUpUserDto, SignInUserDto } from './dto/user.dto';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv'; 
import * as Joi from 'joi';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Timestamp, Unique } from "typeorm";

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

// const mockUser2 = {
//   userId: 2,
//   userName: "test2",
//   email: "",
//   password: "test2",
//   icon: "",
//   createdAt: "",
//   updatedAt: "",
//   name42: "",
//   twoFactorAuth: false,
//   twoFactorAuthSecret: "",
// };

const mockUserRepository = () => ({
  createUser: jest.fn(),
  signUp: jest.fn(),
  signIn: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn().mockResolvedValue(mockUser1), // モックの戻り値を設定
  findOneByName: jest.fn(),
});


describe('UsersService', () => {
  let service: UsersService;
  let module: TestingModule;
  let repository: UserRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
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
        // テスト用のDBを使う方法もある
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
      providers: [UsersService, JwtStrategy, JwtAuthGuard, { provide: UserRepository, useFactory: mockUserRepository }],
      //providers: [UserRepository, UsersService, JwtStrategy, JwtAuthGuard],
      //exports: [JwtStrategy, JwtAuthGuard],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  // afterEach(async () => {
  //   await module.close(); // NestJSのコンテキストを閉じる
  // });

  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });

  // it('should return an array of cats', async () => {
  //   const expected = [mockUser1, mockUser2];
  //   //jest.spyOn(service, 'findAll').mockImplementation(() => result);
  //   repository.findAll.mockResolvedValue(expected);

  //   const result = await service.findAll();

  //   //expect(result).toBe(expected);
  //   expect(result).toEqual(expected);
  // });

  // モックする場合
  describe('signUp', () => {
    it('should return a user', async () => {
      const expected = mockUser1;

      const dto: SignUpUserDto  = {
        userName: mockUser1.userName,
        email: mockUser1.email,
        password: mockUser1.password,
        passwordConfirm: mockUser1.password,
      };

      // signupメソッドのモックを設定（もし必要な場合）
      jest.spyOn(repository, 'createUser').mockResolvedValue(expected);

      const result = await service.signUp(dto);
      
      //expect(result).toEqual(expected);

      // JWT Tokenの検証
      // const verifyResult = jwtService.verify(result);
      // const payload: JwtPayload = { userId: verifyResult.userId, userName: verifyResult.userName, email: verifyResult.email };
      // expect(payload).toEqual({ userId: expected.userId, userName: expected.userName, email: expected.email });

      expect(result).toEqual(expected);

    });
  });

  describe('signIn', () => {
    it('should return a user', async () => {
      const expected = mockUser1;

      const dto: SignInUserDto  = {
        userName: mockUser1.userName,
        password: mockUser1.password,
      };

      // signupメソッドのモックを設定（もし必要な場合）
      jest.spyOn(repository, 'createUser').mockResolvedValue(expected);
      jest.spyOn(repository, 'findOneByName').mockResolvedValue(expected);

      const result = await service.signIn(dto);
      
      //expect(result).toEqual(expected);

      // JWT Tokenの検証
      // const verifyResult = jwtService.verify(result);
      // const payload: JwtPayload = { userId: verifyResult.userId, userName: verifyResult.userName, email: verifyResult.email };
      // expect(payload).toEqual({ userId: expected.userId, userName: expected.userName, email: expected.email });

      expect(result).toEqual(expected);
    });
  });

  describe('currentUser', () => {
    it('should return a user', async () => {
      const expected = mockUser1;

      const dto: SignUpUserDto  = {
        userName: mockUser1.userName,
        email: mockUser1.email,
        password: mockUser1.password,
        passwordConfirm: mockUser1.password,
      };

      jest.spyOn(repository, 'findOneByName').mockResolvedValue(expected);

      // signupメソッドのモックを設定（もし必要な場合）
      const result = await service.currentUser(dto);

      const {password, ...expected2} = expected;

      //expect(result).toEqual(expected);
      expect(result).toEqual(expected2);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expected = [mockUser1];

      // findAllメソッドのモックを設定（もし必要な場合）
      jest.spyOn(repository, 'findAll').mockResolvedValue(expected);

      const result = await service.findAll();

      expect(result).toEqual(expected);
    });
  });


  describe('findOne', () => {
    it('should return a user', async () => {
      const expected = mockUser1;

      // findOneメソッドのモックを設定（もし必要な場合）
      jest.spyOn(repository, 'findOne').mockResolvedValue(expected);

      const result = await service.findOne(1);

      expect(result).toEqual(expected);
    });
  });

  // モックしない場合
  // describe('findAll', () => {
  //   it('should return an array of users', async () => {
  //     const expected = [mockUser1];

  //     const result = await service.findAll();

  //     expect(result).toEqual(expected);
  //   });
  // }
});

// describe('CatsService', () => {
//   let service: UsersService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [UsersService],
//     }).compile();

//     service = module.get<UsersService>(UsersService);
//   });

//   it('should return an array of cats', async () => {
//     const user = new User();
//     const promise = new Promise<User>((resolve, reject) => {
//       resolve(user);
//     });
//     const result = [promise];
//     jest.spyOn(service, 'findAll').mockImplementation(() => result);

//     expect(await service.findAll()).toBe(result);
//   });
// });

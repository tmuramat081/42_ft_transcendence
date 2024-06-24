/* eslint-disable */
import { Injectable, StreamableFile, BadRequestException,
  NotFoundException,
	HttpException,
	InternalServerErrorException,
	UnauthorizedException } from '@nestjs/common';
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
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { SignUpUserDto, SignInUserDto, UpdateUserDto } from './dto/user.dto';
import { UserDto42 } from './dto/user42.dto';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  Unique,
} from 'typeorm';
import * as bycrypt from 'bcrypt';


dotenv.config();
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
  sign: jest.fn(),
  saveUser: jest.fn(),
  addFriend: jest.fn(),
  removeFriend: jest.fn(),
  getFriends: jest.fn(),
  blockUser: jest.fn(),
  unblockUser: jest.fn(),
  getBlockedUsers: jest.fn(),
  createUser42: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let module: TestingModule;
  let repository: UserRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
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
        // // テスト用のDBを使う方法もある
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
      controllers: [UsersController],
      providers: [
        UsersService,
        JwtStrategy,
        JwtAuthGuard,
        { provide: UserRepository, useFactory: mockUserRepository },
      ],
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

      const dto: SignUpUserDto = {
        userName: mockUser1.userName,
        email: mockUser1.email,
        password: mockUser1.password,
        passwordConfirm: mockUser1.password,
      };

      const salt = await bycrypt.genSalt();
      // パスワードのハッシュ化
      expected.password = await bycrypt.hash(expected.password, salt);

      //mockResolvedValueは主に非同期関数のテストに使用される
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

    // userDtoの情報が不足している場合
    it("user data is empty", async() => {
      const dto: SignUpUserDto = {
        userName: "",
        email: "",
        password: "",
        passwordConfirm: "",
      };

      //const result = await service.signUp(dto);

      //expect(result).toEqual(null);

      // expect(await service.signUp(dto)).toThrow(BadRequestException)
      // expect(await service.signUp(dto)).toThrow('Invalid credentials')

      // 例外のテスト
      await expect(service.signUp(dto)).rejects.toThrow(BadRequestException)
      await expect(service.signUp(dto)).rejects.toThrow('Invalid credentials')

    });

    // パスワードが一致しない場合
    it("passwords do not match", async() => {
      const dto: SignUpUserDto = {
        userName: "test",
        email: "test",
        password: "test",
        passwordConfirm: "test1",
      };

      
      await expect(service.signUp(dto)).rejects.toThrow(BadRequestException)
      await expect(service.signUp(dto)).rejects.toThrow('Invalid credentials')
    });
  });

  describe('signIn', () => {
    it('should return a user', async () => {
      const expected = mockUser1;

      const dto: SignInUserDto = {
        userName: mockUser1.userName,
        password: mockUser1.password,
      };

      const salt = await bycrypt.genSalt();
      // パスワードのハッシュ化
      expected.password = await bycrypt.hash(expected.password, salt);


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

    it("should return null", async() => {
      const dto: SignInUserDto = {
        userName: "",
        password: "",
      };

      //const result = await service.signIn(dto);
      
      //expect(result).toEqual(null);
      //expect(result).toThrow()

      await expect(service.signIn(dto)).rejects.toThrow(BadRequestException)
      await expect(service.signIn(dto)).rejects.toThrow('Invalid credentials')
    });
  });

  describe('generteJwt', () => {
    it('should return a jwt token', async () => {
      const user: User = mockUser1;
      //jest.spyOn(jwtService, 'sign').mockResolvedValue('testToken');

      // mockImplementationはより汎用的で、モック関数の挙動を細かく制御したい場合に使用
      jest.spyOn(jwtService, 'sign').mockImplementation(() => 'testToken');


      const result = await service.generateJwt(user);

      expect(result).toEqual('testToken');
    });
  });

  // not used
  // describe('currentUser', () => {
  //   it('should return a user', async () => {
  //     const expected = mockUser1;

  //     const dto: SignUpUserDto = {
  //       userName: mockUser1.userName,
  //       email: mockUser1.email,
  //       password: mockUser1.password,
  //       passwordConfirm: mockUser1.password,
  //     };

  //     jest.spyOn(repository, 'findOneByName').mockResolvedValue(expected);

  //     // signupメソッドのモックを設定（もし必要な場合）
  //     const result = await service.currentUser(dto);

  //     const { password, ...expected2 } = expected;

  //     //expect(result).toEqual(expected);
  //     expect(result).toEqual(expected2);
  //   });
  // });

  // describe('updateUser', () => {
  // });

  //?
  describe('updateUser', () => {
    it('update user success', async () => {
      const expected = mockUser1;

      expected.userName = 'test2';
      expected.email = 'test2@test2.com';

      const dto: UpdateUserDto = {
        userName: expected.userName,
        email: expected.email,
        password: mockUser1.password,
        newPassword: '',
        newPasswordConfirm: '',
      };

      const salt = await bycrypt.genSalt();
      // パスワードのハッシュ化
      expected.password = await bycrypt.hash(expected.password, salt);

      jest.spyOn(repository, 'findOne').mockResolvedValue(expected);
      jest.spyOn(repository, 'saveUser').mockResolvedValue(expected);

      const result = await service.updateUser(expected, dto);

      // console.log(result);
      // console.log(expected);

      expect(result).toEqual(expected);
    });

    // パスワードが間違っている場合
    it('password is incorrect', async () => {
      const dto: UpdateUserDto = {
        userName: mockUser1.userName,
        email: mockUser1.email,
        password: 'test2222',
        newPassword: '',
        newPasswordConfirm: '',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser1);
      jest.spyOn(repository, 'saveUser').mockResolvedValue(mockUser1);

      await expect(service.updateUser(mockUser1, dto)).rejects.toThrow(UnauthorizedException);
      await expect(service.updateUser(mockUser1, dto)).rejects.toThrow('Invalid credentials');
    });

    // ユーザーが存在しない場合
    it('user does not exist', async () => {
      const expected = mockUser1;
      const dto: UpdateUserDto = {
        userName: mockUser1.userName,
        email: mockUser1.email,
        password: mockUser1.password,
        newPassword: '',
        newPasswordConfirm: '',
      };

      const salt = await bycrypt.genSalt();
      // パスワードのハッシュ化
      expected.password = await bycrypt.hash(expected.password, salt);

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'saveUser').mockResolvedValue(null);

      await expect(service.updateUser(expected, dto)).rejects.toThrow(NotFoundException);
      await expect(service.updateUser(expected, dto)).rejects.toThrow('User not found');

    });

    // パスワードを更新する場合
    it('update user password success', async () => {
      const expected = mockUser1;

      expected.password = 'test2';

      const dto: UpdateUserDto = {
        userName: expected.userName,
        email: expected.email,
        password: mockUser1.password,
        newPassword: 'test2',
        newPasswordConfirm: 'test2',
      };

      const salt = await bycrypt.genSalt();
      // パスワードのハッシュ化
      expected.password = await bycrypt.hash(expected.password, salt);

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser1);
      jest.spyOn(repository, 'saveUser').mockResolvedValue(expected);

      const result = await service.updateUser(expected, dto);

      expect(result).toEqual(expected);
    });

    // パスワードを更新する場合（新しいパスワードが一致しない場合）
    it('new password does not match', async () => {
      const expected = mockUser1;
      const dto: UpdateUserDto = {
        userName: mockUser1.userName,
        email: mockUser1.email,
        password: mockUser1.password,
        newPassword: 'test2',
        newPasswordConfirm: 'test3',
      };

      const salt = await bycrypt.genSalt();
      // パスワードのハッシュ化
      expected.password = await bycrypt.hash(expected.password, salt);

      jest.spyOn(repository, 'findOne').mockResolvedValue(expected);
      jest.spyOn(repository, 'saveUser').mockResolvedValue(expected);

      await expect(service.updateUser(expected, dto)).rejects.toThrow(BadRequestException);
      await expect(service.updateUser(expected, dto)).rejects.toThrow('Passwords do not match');
    });
  })

  describe('updateUserIcon', () => {
    it('update user icon success', async () => {
      //console.log(mockUser1);
      const expected = mockUser1;

      // 画像ファイル名を設定
      // test用
      //expected.icon = 'photo-1584949091598-c31daaaa4aa9442a34a2-a684-4135-9a24-b8b62f82e7ce.jpeg';

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser1);
      jest.spyOn(repository, 'saveUser').mockResolvedValue(expected);

      // fileのモックを設定（もし必要な場合）
      const file = {
        filename: 'photo-1584949091598-c31daaaa4aa9442a34a2-a684-4135-9a24-b8b62f82e7ce.jpeg',
      };

      const result = await service.updateUserIcon(mockUser1.userName, file);

      //console.log(result);

      expect(result).toEqual(expected);
    });

    // ユーザーが存在しない場合
    it('user does not exist', async () => {
      const expected = mockUser1;

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'saveUser').mockResolvedValue(null);

      const file = {
        filename: 'photo-1584949091598-c31daaaa4aa9442a34a2-a684-4135-9a24-b8b62f82e7ce.jpeg',
      };

      await expect(service.updateUserIcon(mockUser1.userName, file)).rejects.toThrow(NotFoundException);
      await expect(service.updateUserIcon(mockUser1.userName, file)).rejects.toThrow('User not found');

    });
    // iconが存在しない場合

    it('icon does not exist', async () => {
      const expected = mockUser1;

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser1);
      jest.spyOn(repository, 'saveUser').mockResolvedValue(mockUser1);

      const file = null;

      await expect(service.updateUserIcon(mockUser1.userName, file)).rejects.toThrow(NotFoundException);
      await expect(service.updateUserIcon(mockUser1.userName, file)).rejects.toThrow('User not found');
    });
  });

  // TODO: あとで実装
  // 使っていない
  // describe('getUserIcon', () => {
  //   it('get user icon success', async () => {
  //     const expected = mockUser1;

  //     jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser1);

  //     const result = await service.getUserIcon(mockUser1.userName);

  //     expect(result.path).toEqual("/backend/uploads/iconImages/default.png");
  //   });
  // });

  describe('updateUser2fa', () => {
    it('update user 2fa success', async () => {
      const expected = mockUser1;

      expected.twoFactorAuth = true;

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser1);
      jest.spyOn(repository, 'saveUser').mockResolvedValue(expected);

      const result = await service.updateUser2fa(mockUser1.userName, true);

      expect(result.twoFactorAuth).toEqual(expected.twoFactorAuth);
    });

    it('update user 2fa success', async () => {
      const expected = mockUser1;

      expected.twoFactorAuth = false;

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser1);
      jest.spyOn(repository, 'saveUser').mockResolvedValue(expected);

      const result = await service.updateUser2fa(mockUser1.userName, false);

      expect(result.twoFactorAuth).toEqual(expected.twoFactorAuth);
    });


    // ユーザーが存在しない場合
    it('user does not exist', async () => {
      const expected = mockUser1;

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'saveUser').mockResolvedValue(null);

      await expect(service.updateUser2fa(mockUser1.userName, true)).rejects.toThrow(NotFoundException);
      await expect(service.updateUser2fa(mockUser1.userName, true)).rejects.toThrow('User not found');
    });
  });

  describe('updateUser2faSecret', () => {
    it('update user 2fa secret success', async () => {
      const expected = mockUser1;

      expected.twoFactorAuthSecret

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser1);
      jest.spyOn(repository, 'saveUser').mockResolvedValue(expected);

      const result = await service.updateUser2faSecret(mockUser1.userName, 'testSecret');

      expect(result.twoFactorAuthSecret).toEqual(expected.twoFactorAuthSecret);

    });

    // ユーザーが存在しない場合
    it('user does not exist', async () => {
      const expected = mockUser1;

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'saveUser').mockResolvedValue(null);

      await expect(service.updateUser2faSecret(mockUser1.userName, 'testSecret')).rejects.toThrow(NotFoundException);
      await expect(service.updateUser2faSecret(mockUser1.userName, 'testSecret')).rejects.toThrow('User not found');
    });
  });

  describe('validateUser42', () => {
    it('should return a user', async () => {
      const expected = mockUser1;

      const dto: UserDto42 = {
        name42: mockUser1.name42,
        password: mockUser1.password,
        icon: '',
        email: "test@42.com",
        userName: "test42",
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser1);

      const result = await service.validateUser42(dto);

      expect(result).toEqual(expected);
    });

    // すでに登録されているユーザーの場合
    it('user already exists', async () => {
      const expected: User = {
        userId: 2,
        userName: 'test2',
        email: 'test@42.com',
        password: 'test2',
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
      }

      const dto: UserDto42 = {
        name42: mockUser1.name42,
        password: mockUser1.password,
        icon: '',
        email: "test@42.com",
        userName: "test42",
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      jest.spyOn(repository, 'createUser42').mockResolvedValue(expected);


      const result = await service.validateUser42(dto);

      expect(result).toEqual(expected);
    });

    // ユーザー名がコンフリクトしている場合
    it('user name conflict', async () => {
      const expected = mockUser1;

      expected.name42 = 'test42';

      const dto: UserDto42 = {
        name42: mockUser1.name42,
        password: mockUser1.password,
        icon: '',
        email: "test@42.com",
        userName: "test42",
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(expected);

      //jest.spyOn(repository, 'createUser42').mockResolvedValue(expected);

      //await expect(service.validateUser42(dto)).rejects.toThrow(BadRequestException);

      const result = await service.validateUser42(dto);

      expect(result).toEqual(expected);
    });

    // 42名でuserNameを登録した時に、すでにuserNameが存在している場合のテストが難しいので省略
  });

  describe('addFriend', () => {
    it('should return a user', async () => {
      const expected = mockUser1;

      const friend: User = {
        userId: 2,
        userName: 'test2',
        email: 'test2@test2.com',
        password: 'test2',
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

      expected.friends.push(friend);

      // jest.spyOn(repository, 'findOne').mockResolvedValue(friend);
      // jest.spyOn(repository, 'saveUser').mockResolvedValue(expected);
      jest.spyOn(repository, 'addFriend').mockResolvedValue(expected);

      const result = await service.addFriend(mockUser1, friend.userName);

      expect(result).toEqual(expected);
    });

    // ユーザーが存在しない場合
    it('user does not exist', async () => {
      const expected = mockUser1;

      const friend: User = {
        userId: 2,
        userName: 'test2',
        email: 'test2@test2.com',
        password: 'test2',
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

      expected.friends.push(friend);
      jest.spyOn(repository, 'addFriend').mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.addFriend(mockUser1, friend.userName)).rejects.toThrow(NotFoundException);
      await expect(service.addFriend(mockUser1, friend.userName)).rejects.toThrow('User not found');

    });

    // すでに友達リストにいる場合
    it('friend does exist', async () => {
      const expected = mockUser1;

      const friend: User = {
        userId: 2,
        userName: 'test2',
        email: 'test2@test2.com',
        password: 'test2',
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

      //expected.friends.push(friend);

      jest.spyOn(repository, 'addFriend').mockRejectedValue(new BadRequestException('Already friends'));

      await expect(service.addFriend(mockUser1, friend.userName)).rejects.toThrow(BadRequestException);
      await expect(service.addFriend(mockUser1, friend.userName)).rejects.toThrow('Already friends');
    });
  });

  describe('removeFriend', () => {
    it('should return a user', async () => {
      const expected = mockUser1;

      const friend: User = {
        userId: 2,
        userName: 'test2',
        email: 'test2@test2.com',
        password: 'test2',
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

      //xpected.friends = expected.friends.filter((f) => f.userId !== friend.userId);

      expected.friends.push(friend);

      jest.spyOn(repository, 'removeFriend').mockResolvedValue(mockUser1);

      const result = await service.removeFriend(mockUser1, friend.userName);

      expect(result).toEqual(expected);
    });

    // ユーザーが存在しない場合
    it('user does not exist', async () => {
      const expected = mockUser1;

      const friend: User = {
        userId: 2,
        userName: 'test2',
        email: 'test2@test2.com',
        password: 'test2',
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

      expected.friends.push(friend);

      jest.spyOn(repository, 'removeFriend').mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.removeFriend(mockUser1, friend.userName)).rejects.toThrow(NotFoundException);
      await expect(service.removeFriend(mockUser1, friend.userName)).rejects.toThrow('User not found');
    });

    // 友達リストにいない場合
    it('friend does not exist', async () => {
      const expected = mockUser1;

      const friend: User = {
        userId: 2,
        userName: 'test2',
        email: 'test2@test2.com',
        password: 'test2',
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

      //expected.friends.push(friend);

      jest.spyOn(repository, 'removeFriend').mockRejectedValue(new BadRequestException('Friend not found'));

      await expect(service.removeFriend(mockUser1, friend.userName)).rejects.toThrow(BadRequestException);
      await expect(service.removeFriend(mockUser1, friend.userName)).rejects.toThrow('Friend not found');
    });
  });

  describe('getFriends', () => {
    it('should return an array of users', async () => {
      const expected = mockUser1;

      const friend: User = {
        userId: 2,
        userName: 'test2',
        email: 'test2@test2.com',
        password: 'test2',
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

      expected.friends.push(friend);

      jest.spyOn(repository, 'getFriends').mockResolvedValue(expected.friends);

      const result = await service.getFriends(mockUser1);

      expect(result).toEqual(expected.friends);
    });
  });

  describe('blockUser', () => {
    it('should return a user', async () => {
      const expected = mockUser1;

      const blocked: User = {
        userId: 2,
        userName: 'test2',
        email: 'test2@test2.com',
        password: 'test2',
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

      expected.blocked.push(blocked);

      jest.spyOn(repository, 'blockUser').mockResolvedValue(expected);

      const result = await service.blockUser(mockUser1, blocked.userName);

      expect(result).toEqual(expected);

    });

    // ユーザーが存在しない場合
    it('user does not exist', async () => {
      const expected = mockUser1;

      const blocked: User = {
        userId: 2,
        userName: 'test2',
        email: 'test2@test2.com',
        password: 'test2',
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

      expected.blocked.push(blocked);

      jest.spyOn(repository, 'blockUser').mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.blockUser(mockUser1, blocked.userName)).rejects.toThrow(NotFoundException);
      await expect(service.blockUser(mockUser1, blocked.userName)).rejects.toThrow('User not found');
    });

    // すでにブロックしている場合
    it('user already blocked', async () => {
      const expected = mockUser1;

      const blocked: User = {
        userId: 2,
        userName: 'test2',
        email: 'test2@test2.com',
        password: 'test2',
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

      expected.blocked.push(blocked);

      jest.spyOn(repository, 'blockUser').mockRejectedValue(new BadRequestException('Already blocked'));

      await expect(service.blockUser(mockUser1, blocked.userName)).rejects.toThrow(BadRequestException);
      await expect(service.blockUser(mockUser1, blocked.userName)).rejects.toThrow('Already blocked');

    });
  });

  describe('unblockUser', () => {
    it('should return a user', async () => {
      const expected = mockUser1;

      const blocked: User = {
        userId: 2,
        userName: 'test2',
        email: 'test2@test2.com',
        password: 'test2',
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

      expected.blocked.push(blocked);

      jest.spyOn(repository, 'unblockUser').mockResolvedValue(mockUser1);

      const result = await service.unblockUser(mockUser1, blocked.userName);

      expect(result).toEqual(expected);

    });

    // ユーザーが存在しない場合
    it('user does not exist', async () => {
      const expected = mockUser1;

      const blocked: User = {
        userId: 2,
        userName: 'test2',
        email: 'test2@test2.com',
        password: 'test2',
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

      expected.blocked.push(blocked);

      jest.spyOn(repository, 'unblockUser').mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.unblockUser(mockUser1, blocked.userName)).rejects.toThrow(NotFoundException);
      await expect(service.unblockUser(mockUser1, blocked.userName)).rejects.toThrow('User not found');

    });

    // ブロックしていない場合
    it('user not blocked', async () => {
      const expected = mockUser1;

      const blocked: User = {
        userId: 2,
        userName: 'test2',
        email: 'test2@test2.com',
        password: 'test2',
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

      expected.blocked.push(blocked);

      jest.spyOn(repository, 'unblockUser').mockRejectedValue(new BadRequestException('Not blocked'));

      await expect(service.unblockUser(mockUser1, blocked.userName)).rejects.toThrow(BadRequestException);
      await expect(service.unblockUser(mockUser1, blocked.userName)).rejects.toThrow('Not blocked');
    });
  });

  describe('getBlockedUsers', () => {
    it('should return an array of users', async () => {
      const expected = mockUser1;

      const blocked: User = {
        userId: 2,
        userName: 'test2',
        email: 'test2@test2.com',
        password: 'test2',
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

      expected.blocked.push(blocked);

      jest.spyOn(repository, 'getBlockedUsers').mockResolvedValue(expected.blocked);

      const result = await service.getBlockeds(mockUser1);

      expect(result).toEqual(expected.blocked);

    });

    // ユーザーが存在しない場合

    // ブロックしているユーザーがいない場合
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

  describe('findOneByName', () => {

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

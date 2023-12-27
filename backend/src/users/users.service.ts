import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './users.repository';
import { UserDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from './interfaces/jwt_payload';
import * as bcrypt from 'bcrypt';

/*
Service
ビジネスロジックの実装: アプリケーションの核となるビジネスロジックを実装します。
データの加工・変換: ビジネスロジックに基づいてデータを加工・変換し、必要な形式にします。
リポジトリとの連携: データベースや他のストレージへのアクセスをリポジトリを通じて行います。
サードパーティサービスとの統合: 外部APIやサービスとの連携を管理します。
*/

@Injectable()
export class UsersService {
    constructor(
        // 依存性注入
        //@InjectRepository(User)
        //private userRepository: Repository<User>,
        //private connection: Connection,

        private userRepository: UserRepository,
        private jwtService: JwtService,
    ) {}

    async signUp(userData: UserDto): Promise<string> {
        var user: User = new User();
        user.userName = userData.userName;
        user.email = userData.email;
        user.password = userData.password;

        // ユーザーの作成
        const resultUser: User = await this.userRepository.createUser(user);
        //return resultUser;
        //return await this.userRepository.createUser(user);

        //JWTを返す？
        const payload: JwtPayload = { userId: resultUser.userId, userName: resultUser.userName, email: resultUser.email };
        const accessToken: string = this.jwtService.sign(payload);
        return accessToken
    }

    async signIn(userData: UserDto): Promise<string> {
        // ユーザーの検索
        const user: User = await this.userRepository.findOneByName(userData.userName);
        // パスワードの検証
        if (user && user.password === userData.password && bcrypt.compare(userData.password, user.password)) {
            // JWTを返す？
            const payload: JwtPayload = { userId: user.userId, userName: user.userName, email: user.email };
            const accessToken: string = this.jwtService.sign(payload);
            return accessToken
        } else {
            return null
        }
    }

    // Partial<User> は User の一部のプロパティを表す
    async currentUser(userData: UserDto): Promise<Partial<User>> {
        // ユーザーの検索
        const user: User = await this.userRepository.findOneByName(userData.userName);
        const { password, ...result } = user;
        return result
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.findAll();
    }
}

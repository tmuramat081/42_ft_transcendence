import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './users.repository';

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
        @InjectRepository(User)
        private userRepository: UserRepository,
        //private userRepository: Repository<User>,
        //private connection: Connection,
    ) {}

    async createUser(user: User): Promise<User> {
        return await this.userRepository.createUser(user);
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.findAll();
    }
}

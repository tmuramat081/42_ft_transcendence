import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { User } from './entities/user.entity';


@Injectable()
export class UsersService {
    constructor(
        // 依存性注入
        @InjectRepository(User)
        private userRepository: Repository<User>,
        //private connection: Connection,
    ) {}

    async findAll(): Promise<User[]> {
        // リポジトリパターンの方がいい？
        // return this.userRepository.find();
        //return this.connection.getRepository(User).find();
        return this.userRepository.find();
    }

    async findOne(id: number): Promise<User | undefined> {
        //return this.connection.getRepository(User).findOne({ where: { user_id: id } });
        return this.userRepository.findOne({ where: { user_id: id }});
    }

    async findOneByName(name: string): Promise<User | undefined> {
        //return this.connection.getRepository(User).findOne({ where: { user_name: name } });
        return this.userRepository.findOne({ where: { user_name: name } });
    }
    
    // async findOne(username: string): Promise<User | undefined> {
    //     return this.userRepository.findOne({ user_name: username });
    // }
    
    // async findOneById(id: number): Promise<User | undefined> {
    //     return this.userRepository.findOne({ user_id: id });
    // }
    
    // async findOneByEmail(email: string): Promise<User | undefined> {
    //     return this.userRepository.findOne({ email: email });
    // }
    
    // async findOneByName42(name42: string): Promise<User | undefined> {
    //     return this.userRepository.findOne({ name42: name42 });
    // }
    
    // async findOneByTwoFactorAuthSecret(secret: string): Promise<User | undefined> {
    //     return this.userRepository.findOne({ two_factor_auth_secret: secret });
    // }
    
    // async save(user: User): Promise<User> {
    //     return this.userRepository.save(user);
    // }
    
    // async remove(user: User): Promise<User> {
    //     return this.userRepository.remove(user);
    // }
}

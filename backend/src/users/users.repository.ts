/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { User } from './entities/user.entity';
import * as bycrypt from 'bcrypt';

/*
Repository
データ永続化: データベースや他のデータストレージへのデータの保存、更新、削除を担当します。
データ検索: クエリを用いてデータベースからデータを検索し、取得します。
データアクセスの抽象化: データベースやデータストレージの詳細を抽象化し、ビジネスロジックから分離します。
データアクセスロジックのカプセル化: 具体的なデータベース操作をカプセル化し、ビジネスロジックから独立させます。
*/

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(user: User): Promise<User> {
    const salt = await bycrypt.genSalt();
    // パスワードのハッシュ化
    user.password = await bycrypt.hash(user.password, salt);

    return await this.userRepository.save(user);
  }

  // idからUserを取得して、Userを更新する
  // 二つのUserを渡す方法もある
  async saveUser(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  // async deleteOldImage(user: User) {
  //   const fs = require('fs');
  //   const filePath = process.cwd() + process.env.AVATAR_IMAGE_DIR + user.icon;
  //   fs.stat(filePath, (err: any, stats: any) => {
  //     if (err) {
  //       console.error(err);
  //       return
  //     }

  //     // ファイルが存在する場合
  //     fs.unlink(filePath, (err: any) => {
  //         if (err) {
  //           console.error(err);
  //           return
  //         }
  //       },
  //     );
  //   });
  // }

  // async saveImage(icon , user: User): Promise<string> { 
  //   if (!icon?.filename) 

  //   user.icon = icon.name;
  //   return await this.userRepository.save(user);
  // }

  // 他のカスタムメソッドをここに追加できます
  async findAll(): Promise<User[]> {
    // リポジトリパターンの方がいい？
    // return this.userRepository.find();
    //return this.connection.getRepository(User).find();
    return this.userRepository.find();
  }

  // async findOne(id: number): Promise<User | undefined> {
  //     //return this.connection.getRepository(User).findOne({ where: { user_id: id } });
  //     return this.userRepository.findOne({ where: { userId: id }});
  // }

  async findOne(params: any): Promise<User | undefined> {
    return this.userRepository.findOne(params);
  }

  async findOneByName(name: string): Promise<User | undefined> {
    //return this.connection.getRepository(User).findOne({ where: { user_name: name } });
    return this.userRepository.findOne({ where: { userName: name } });
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

  async createUser42(user: User): Promise<User> {
    const salt = await bycrypt.genSalt();
    // パスワードのハッシュ化
    user.password = await bycrypt.hash(user.password, salt);
    return this.userRepository.save(user);
  }
}

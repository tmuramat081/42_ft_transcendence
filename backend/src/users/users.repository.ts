/* eslint-disable */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { User } from './entities/user.entity';
import * as bycrypt from 'bcrypt';
import { UpdatePointDto } from './dto/user.dto';

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

  // いる？
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

  async findAllByIds(ids: number[]): Promise<User[]> {
    return this.userRepository.findByIds(ids);
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
    return this.userRepository.findOne({ where: { userName: name }, relations: ['friends', 'blocked'] });
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

  // cereateUserと同じ
  async createUser42(user: User): Promise<User> {
    const salt = await bycrypt.genSalt();
    // パスワードのハッシュ化
    user.password = await bycrypt.hash(user.password, salt);
    return this.userRepository.save(user);
  }

  async addFriend(user: User, friendName: string): Promise<User> {
    //targetを取得
    const target: User = await this.findOneByName(friendName);
    if (!target) {
      //throw new Error('User not found');
      throw new NotFoundException('User not found');
    }

    // すでに友達リストにいるかどうか
    if (user.friends.some((friend) => friend.userId === target.userId)) {
      //throw new Error('Already friends');
      throw new BadRequestException('Already friends');
    }

    user.friends.push(target);
    return await this.userRepository.save(user);
    // 自分の友達リストにtargetを追加
  }

  async removeFriend(user: User, friendName: string): Promise<User>{
    //targetを取得
    const target: User = await this.findOneByName(friendName);
    if (!target) {
      //throw new Error('User not found');
      throw new NotFoundException('User not found');
    }

    // 友達にいない場合
    if (!user.friends.some((friend) => friend.userId === target.userId)) {
      //throw new Error('Not friends');
      throw new BadRequestException('Already friends');
    }

    user.friends = user.friends.filter((friend) => friend.userId !== target.userId);
    return await this.userRepository.save(user);
    // 自分の友達リストからtargetを削除
  }

  async getFriends(user: User): Promise<User[]> {
    // データ整形が必要？パスワードなどが含まれているかも
    return user.friends;
  }

  async blockUser(user: User, blockName: string): Promise<User> {
    //targetを取得
    const target: User = await this.findOneByName(blockName);
    if (!target) {
      //throw new Error('User not found');
      throw new NotFoundException('User not found');
    }

    // すでにブロックリストにいるかどうか
    if (user.blocked.some((blocked) => blocked.userId === target.userId)) {
      //throw new Error('Already blocked');
      throw new BadRequestException('Already friends');
    }

    user.blocked.push(target);
    return await this.userRepository.save(user);
    // 自分のブロックリストにtargetを追加
  }

  async unblockUser(user: User, blockName: string): Promise<User> {
    //targetを取得
    const target: User = await this.findOneByName(blockName);
    if (!target) {
      //throw new Error('User not found');
      throw new NotFoundException('User not found');
    }

    // ブロックリストにいない場合
    if (!user.blocked.some((blocked) => blocked.userId === target.userId)) {
      //throw new Error('Not blocked');
      throw new BadRequestException('Not blocked');
    }

    user.blocked = user.blocked.filter((blocked) => blocked.userId !== target.userId);
    return await this.userRepository.save(user);
    // 自分のブロックリストからtargetを削除
  }

  async getBlockedUsers(user: User): Promise<User[]> {
    // データ整形が必要？パスワードなどが含まれているかも
    return user.blocked;
  }

  async updatePoint(data: UpdatePointDto): Promise<User> {
    const target: User = await this.userRepository.findOne({ where: { userId: data.userId }, relations: ['friends', 'blocked'] });
    if (!target) {
      //throw new Error('User not found');
      throw new NotFoundException('User not found');
    }

    target.point = data.point;
    return await this.userRepository.save(target);
  }

  async getRanking(userName: string): Promise<number> {
    // ユーザーをポイントの降順、作成日の昇順で取得
    const sortedUsers = await this.userRepository.find({
      order: {
        point: 'DESC',
        createdAt: 'ASC',
      },
    });

    // ユーザーIDに基づいてランキングを見つける
    const userIndex = sortedUsers.findIndex((user) => user.userName === userName);
    const ranking = userIndex + 1;

    return ranking;
  }
}
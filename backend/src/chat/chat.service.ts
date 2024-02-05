import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { ChatLog } from './entities/chatlog.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,

    @InjectRepository(ChatLog)
    private chatLogRepository: Repository<ChatLog>,
  ) {}

  // データベースのマイグレーション用メソッド
  async runMigrations(): Promise<void> {
    // マイグレーションを実行
    await this.roomRepository.query('Your SQL Query for Room Entity');
    await this.chatLogRepository.query('Your SQL Query for ChatLog Entity');
  }
}

import { EntityManager, Repository } from 'typeorm';
import { GameEntry } from './entities/gameEntry.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GameEntryRepository {
  constructor(
    @InjectRepository(GameEntry)
    private gameEntryRepository: Repository<GameEntry>,
  ) {}

  // ゲーム参加者を1件登録（[INFO] トランザクションを張る場合は、managerを引数に指定する）
  async createGameEntry(gameEntry: GameEntry, manager?: EntityManager): Promise<GameEntry> {
    const repository = manager?.getRepository(GameEntry) || this.gameEntryRepository;
    try {
      return await repository.save(gameEntry);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}

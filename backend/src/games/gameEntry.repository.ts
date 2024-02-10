import { DataSource, EntityManager, Repository } from 'typeorm';
import { GameEntry } from './entities/gameEntry.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class GameEntryRepository extends Repository<GameEntry> {
  constructor(private dataSource: DataSource) {
    super(GameEntry, dataSource.createEntityManager());
  }

  // ゲーム参加者を1件登録（[INFO] トランザクションを張る場合は、managerを引数に指定する）
  async createGameEntry(gameEntry: GameEntry, manager?: EntityManager): Promise<GameEntry> {
    const repository = manager?.getRepository(GameEntry) || this;
    try {
      return await repository.save(gameEntry);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}

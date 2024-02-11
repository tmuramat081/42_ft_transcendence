import { EntityManager, Repository } from 'typeorm';
import { GameEntry } from './entities/gameEntry.entity';
import { InternalServerErrorException } from '@nestjs/common';

export interface GameEntryRepository extends Repository<GameEntry> {
  this: Repository<GameEntry>;
  createGameEntry(gameEntry: GameEntry, manager?: EntityManager): Promise<GameEntry>;
}

export const customGameEntryRepository: Pick<GameEntryRepository, 'createGameEntry'> = {
  async createGameEntry(
    this: Repository<GameEntry>,
    gameEntry: GameEntry,
    manager?: EntityManager,
  ): Promise<GameEntry> {
    const repository = manager?.getRepository(GameEntry) || this;
    try {
      return await repository.save(gameEntry);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  },
};

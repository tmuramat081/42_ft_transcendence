import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameRecord } from './entities/gameRecord.entity';
import { CreateGameRecordDto } from './dto/gameRecord.dto';
import { GameRecordWithUserName } from './interfaces/records.interface';

// 見直し

@Injectable()
export class RecordsRepository {
  constructor(
    @InjectRepository(GameRecord)
    private gameRecordRepository: Repository<GameRecord>,
  ) {}

  async gameRecordById(id: number): Promise<GameRecord | null> {
    return await this.gameRecordRepository.findOne({ where: {gameRecordId: id}, 
            relations: ['loser', 'winner'],
    });
  }

  async gameRecord(params: any): Promise<GameRecord | null> {
    return await this.gameRecordRepository.findOne(params);
  }

  async gameRecords(params: {
    skip?,
    take?,
    cursor?,
    where?,
    orderBy?,
  }): Promise<GameRecordWithUserName[]> {
    const { skip, take, cursor, where, orderBy } = params;

    // ここに追加のwhere条件やorderBy条件を設定することができます。
    const queryBuilder = this.gameRecordRepository.createQueryBuilder('gameRecord')
      .leftJoinAndSelect('gameRecord.loser', 'loser')
      .leftJoinAndSelect('gameRecord.winner', 'winner');

    if (skip) queryBuilder.skip(skip);
    if (take) queryBuilder.take(take);
    if (cursor) {
      // queryBuilder.where('gameRecord.id > :cursor', { cursor });
    }
    if (where) {
      // 追加のwhere条件は、具体的な条件に応じて設定する必要があります。
      if (where?.OR) {
        const orConditions = where.OR.map(condition => {
          const queries = [];
          if (condition.winnerId !== undefined) {
            queries.push('gameRecord.winnerId = :winnerId');
          }
          if (condition.loserId !== undefined) {
            queries.push('gameRecord.loserId = :loserId');
          }
          return `(${queries.join(' OR ')})`;
        }).join(' OR ');

        queryBuilder.where(orConditions, {
          winnerId: where.OR[0]?.winnerId,
          loserId: where.OR[1]?.loserId,
        });

      }
    }
    if (orderBy) {
      // orderBy条件は、具体的なソートキーに応じて設定する必要があります。
      for (const key in orderBy) {
        if (orderBy[key] === 'ASC' || orderBy[key] === 'DESC') {
          queryBuilder.addOrderBy(`gameRecord.${key}`, orderBy[key]);
        }
      }
    }

    // ここでクエリを実行します。
    const records = await queryBuilder.getMany();

    console.log('records:', records);

    // interfaceを使って、返り値の形を定義します。
    return records.map(record => ({
      id: record.gameRecordId,
      winnerScore: record.winnerScore,
      loserScore: record.loserScore,
      createdAt: record.createdAt,
      loserName: record.loser.userName,
      winnerName: record.winner.userName,
    }));
  }

  async createGameRecord(data: CreateGameRecordDto): Promise<GameRecord> {
    const gameRecord = this.gameRecordRepository.create(data);
    return await this.gameRecordRepository.save(gameRecord);
  }

  async updateGameRecord(id: number, data: Partial<GameRecord>): Promise<GameRecord> {
    await this.gameRecordRepository.update(id, data);
    return this.gameRecordRepository.findOne({where: { gameRecordId: id }});
  }

  async deleteGameRecord(id: number): Promise<void> {
    await this.gameRecordRepository.delete(id);
  }
}

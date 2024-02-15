import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GameRoom } from './entities/gameRoom.entity';
import { DataSource, Repository, Like } from 'typeorm';

export type FindGameRoomWhereInput = Partial<
  Omit<GameRoom, 'gameRoomId' | 'createdAt' | 'updatedAt'>
>;

@Injectable()
export class GameRoomRepository extends Repository<GameRoom> {
  constructor(private dataSource: DataSource) {
    super(GameRoom, dataSource.createEntityManager());
  }

  // ゲームルームを一件取得
  async findOneGameRoom(gameRoomId: number): Promise<GameRoom | undefined> {
    try {
      return await this.findOneBy({
        gameRoomId: gameRoomId,
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  // ゲームルームを複数件取得
  async findManyGameRooms(
    whereInput: FindGameRoomWhereInput,
    paginationInput?: { take?: number; skip?: number },
  ): Promise<[GameRoom[], number]> {
    const whereCondition = {
      roomName: whereInput.roomName ? Like(`%${whereInput.roomName}%`) : undefined,
      roomStatus: whereInput.roomStatus,
    };
    try {
      return await this.findAndCount({
        where: whereCondition,
        take: paginationInput?.take,
        skip: paginationInput?.skip,
        order: { createdAt: 'DESC', gameRoomId: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  // ゲームルームの件数を取得
  async countGameRooms(whereInput: FindGameRoomWhereInput): Promise<number> {
    try {
      return await this.count({
        where: whereInput,
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}

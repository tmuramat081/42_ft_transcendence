import { InternalServerErrorException } from '@nestjs/common';
import { GameRoom } from './entities/gameRoom.entity';
import { Repository, Like, EntityManager } from 'typeorm';

export type FindGameRoomWhereInput = Partial<
  Omit<GameRoom, 'gameRoomId' | 'createdAt' | 'updatedAt'>
>;
export type CreateGameRoomInput = Partial<Omit<GameRoom, 'gameRoomId' | 'createdAt' | 'updatedAt'>>;

export interface GameRoomRepository extends Repository<GameRoom> {
  this: Repository<GameRoom>;
  findOneGameRoom(gameRoomId: number): Promise<GameRoom | undefined>;
  findManyGameRooms(
    whereInput: FindGameRoomWhereInput,
    paginationInput?: { take?: number; skip?: number },
  ): Promise<[GameRoom[], number]>;
  countGameRooms(whereInput: FindGameRoomWhereInput): Promise<number>;
  createGameRoom(inputData: CreateGameRoomInput, manager?: EntityManager): Promise<GameRoom>;
}

export const customGameRoomRepository: Pick<
  GameRoomRepository,
  'findOneGameRoom' | 'findManyGameRooms' | 'countGameRooms' | 'createGameRoom'
> = {
  // ゲームルームを一件取得
  async findOneGameRoom(
    this: Repository<GameRoom>,
    gameRoomId: number,
  ): Promise<GameRoom | undefined> {
    try {
      return await this.findOneBy({
        gameRoomId: gameRoomId,
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  },

  // ゲームルームを複数件取得
  async findManyGameRooms(
    this: Repository<GameRoom>,
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
  },

  // ゲームルームの件数を取得
  async countGameRooms(
    this: Repository<GameRoom>,
    whereInput: FindGameRoomWhereInput,
  ): Promise<number> {
    try {
      return await this.count({
        where: whereInput,
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  },

  // ゲームルームを1件登録（[INFO] トランザクションを張る場合は、managerを引数に指定する）
  async createGameRoom(
    this: Repository<GameRoom>,
    inputData: GameRoom,
    manager?: EntityManager,
  ): Promise<GameRoom> {
    const repository = manager ? manager.getRepository(GameRoom) : this;
    try {
      return await repository.save(inputData);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  },
};

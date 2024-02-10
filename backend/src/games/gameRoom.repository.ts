import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GameRoom } from './entities/gameRoom.entity';
import { Repository, Like, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export type FindGameRoomWhereInput = Partial<
  Omit<GameRoom, 'gameRoomId' | 'createdAt' | 'updatedAt'>
>;

export type CreateGameRoomInput = Partial<Omit<GameRoom, 'gameRoomId' | 'createdAt' | 'updatedAt'>>;

@Injectable()
export class GameRoomRepository {
  constructor(
    @InjectRepository(GameRoom)
    private gameRoomRepository: Repository<GameRoom>,
  ) {}

  // ゲームルームを一件取得
  async findOneGameRoom(gameRoomId: number): Promise<GameRoom | undefined> {
    try {
      return await this.gameRoomRepository.findOneBy({
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
      return await this.gameRoomRepository.findAndCount({
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
      return await this.gameRoomRepository.count({
        where: whereInput,
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  // ゲームルームを1件登録（[INFO] トランザクションを張る場合は、managerを引数に指定する）
  async createGameRoom(inputData: GameRoom, manager?: EntityManager): Promise<GameRoom> {
    const repository = manager ? manager.getRepository(GameRoom) : this.gameRoomRepository;
    try {
      return await repository.save(inputData);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GameRoom } from './entities/gameRoom.entity';
import { DataSource, Repository } from 'typeorm';

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
}

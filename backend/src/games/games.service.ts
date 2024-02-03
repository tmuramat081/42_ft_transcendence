import { GameRoomRepository } from './gameRoom.repository';

export class GamesService {
  constructor(private gameRoomRepository: GameRoomRepository) {}

  /**
   * ゲームルーム取得
   */
  async findOneGameRoom(gameRoomId: number) {
    return this.gameRoomRepository.findOneGameRoom(gameRoomId);
  }
}

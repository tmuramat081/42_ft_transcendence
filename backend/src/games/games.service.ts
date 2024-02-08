import { IPaginationEnvelope } from '@/common/interface/pagination';
import { ListGameRoomsRequestDto } from './dto/request/listGameRoomsRequest.dto';
import { GameRoom } from './entities/gameRoom.entity';
import {
  FindGameRoomWhereInput,
  GameRoomRepository,
} from './gameRoom.repository';
import { InjectRepository } from '@nestjs/typeorm';

export class GamesService {
  constructor(
    @InjectRepository(GameRoomRepository)
    private gameRoomRepository: GameRoomRepository,
  ) {}
  /**
   * ゲームルーム一覧取得
   */
  async listGameRooms(
    requestDto: ListGameRoomsRequestDto,
  ): Promise<{ result: GameRoom[]; pagination: IPaginationEnvelope }> {
    // 取得条件を生成
    const whereInput: FindGameRoomWhereInput = {
      roomName: requestDto['room-name'],
      roomStatus: requestDto['room-status'],
    };
    // ページング条件を生成
    const paginationInput = {
      take: requestDto['take-count'],
      skip: (requestDto['page-number'] - 1) * requestDto['take-count'],
    };
    // ゲームルームを複数取得
    const [result, count] = await this.gameRoomRepository.findManyGameRooms(
      whereInput,
      paginationInput,
    );
    // ページネーション情報を作成
    const pagination: IPaginationEnvelope = {
      total: count,
      currentPage: requestDto['page-number'],
      perPage: result.length,
    };
    // 取得結果を返却
    return { result, pagination };
  }
}

import { UserRepository } from './../users/users.repository';
import { IPaginationEnvelope } from '@/common/interface/pagination';
import { ListGameRoomsRequestDto } from './dto/request/listGameRoomsRequest.dto';
import { GameRoom } from './entities/gameRoom.entity';
import { FindGameRoomWhereInput, GameRoomRepository } from './gameRoom.repository';
import { CreateGameRoomRequestDto } from './dto/request/createGameRoomRequest.dto';
import { GAME_ROOM_STATUS } from './game.constant';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { GameEntryRepository } from './gameEntry.repository';
import { DataSource, EntityManager } from 'typeorm';
import { GameEntry } from './entities/gameEntry.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/users/entities/user.entity';

export class GamesService {
  constructor(
    @InjectRepository(User)
    private userRepository: UserRepository,
    private gameRoomRepository: GameRoomRepository,
    private gameEntryRepository: GameEntryRepository,
    private dataSource: DataSource,
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

  /**
   * ゲームルーム登録
   */
  async createGameRoom(requestDto: CreateGameRoomRequestDto): Promise<void> {
    // 登録者の存在チェック（TODO: JWTから取得するなら不要）
    const user = await this.userRepository.findOne({
      where: { userId: requestDto.createUserId },
    });
    if (!user) {
      throw new NotFoundException();
    }

    /** トランザクション処理 */
    await this.dataSource.transaction(async (manager: EntityManager) => {
      // ゲームルームを作成
      const gameRoom = manager.create(GameRoom, {
        roomName: requestDto.roomName,
        note: requestDto.note,
        maxPlayers: requestDto.maxPlayers,
        roomStatus: GAME_ROOM_STATUS.WAITING,
        createdBy: user.userId,
      });
      // ゲームルームを登録
      const created = await this.gameRoomRepository.createGameRoom(gameRoom, manager);
      if (!created) {
        throw new InternalServerErrorException();
      }

      // ゲーム参加者を作成
      const gameEntry = manager.create(GameEntry, {
        gameRoomId: created.gameRoomId,
        userId: user.userId,
        playerName: requestDto.playerName,
        administratorFlag: true,
      });
      // ゲーム参加者を登録
      await this.gameEntryRepository.createGameEntry(gameEntry, manager);
    });
  }
}

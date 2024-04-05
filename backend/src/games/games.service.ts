import { IPaginationEnvelope } from '@/common/interface/pagination';
import { ListGameRoomsRequestDto } from './dto/request/listGameRoomsRequest.dto';
import { GameRoom } from './entities/gameRoom.entity';
import { FindGameRoomWhereInput, GameRoomRepository } from './gameRoom.repository';
import { CreateGameRoomRequestDto } from './dto/request/createGameRoomRequest.dto';
import { GAME_ROOM_STATUS } from './game.constant';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GameEntryRepository } from './gameEntry.repository';
import { DataSource, EntityManager } from 'typeorm';
import { GameEntry } from './entities/gameEntry.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  API_ERROR_MESSAGE,
  NotFoundMessage,
  TABLE_NAME,
} from '@/common/constant/errorMessage.constant';

export interface IGameEntry {
  gameRoomId: number;
  userId: number;
  playerName: string;
  administratorFlag: boolean;
}

export class GamesService {
  constructor(
    @InjectRepository(GameRoom)
    private readonly gameRoomRepository: GameRoomRepository,
    @InjectRepository(GameEntry)
    private readonly gameEntryRepository: GameEntryRepository,
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
    // ユーザーの存在チェックはJWT認証で行っているため、ここでは省く

    /** トランザクション処理 */
    await this.dataSource.transaction(async (manager: EntityManager) => {
      // ゲームルームを作成
      const gameRoom = manager.create(GameRoom, {
        roomName: requestDto.roomName,
        note: requestDto.note,
        maxPlayers: requestDto.maxPlayers,
        roomStatus: GAME_ROOM_STATUS.WAITING,
        createdBy: requestDto.createUserId,
      });
      // ゲームルームを登録
      const created = await this.gameRoomRepository.createGameRoom(gameRoom, manager);
      if (!created) {
        throw new InternalServerErrorException();
      }

      // ゲーム参加者を作成
      const gameEntry = manager.create(GameEntry, {
        gameRoomId: created.gameRoomId,
        userId: requestDto.createUserId,
        playerName: requestDto.playerName,
        administratorFlag: true,
      });
      // ゲーム参加者を登録
      await this.gameEntryRepository.createGameEntry(gameEntry, manager);
    });
  }

  /**
   * ゲーム参加者登録
   */
  async createGameEntry(gameEntry: IGameEntry): Promise<void> {
    // トランザクション開始
    await this.dataSource.transaction(async (manager: EntityManager) => {
      // ゲームルームを取得（行ロック）
      const gameRoom = await this.gameRoomRepository.findOneGameRoomForUpdate(
        gameEntry.gameRoomId,
        manager,
      );
      if (!gameRoom) {
        // ゲームルームが存在しない場合はエラー
        throw new NotFoundException(NotFoundMessage(TABLE_NAME.GAME_ROOM));
      }

      // ゲーム参加者を取得
      const gameEntries = await this.gameEntryRepository.findManyGameEntries(
        gameEntry.gameRoomId,
        manager,
      );
      if (gameEntries?.length >= gameRoom.maxPlayers) {
        // 参加者が最大プレーヤー数に達している場合はエラー
        throw new BadRequestException(API_ERROR_MESSAGE.BUSINESS_LOGIC.MAX_GAME_ENTRY_REACHED);
      }

      // ゲーム参加者を作成
      const entry = manager.create(GameEntry, {
        gameRoomId: gameEntry.gameRoomId,
        userId: gameEntry.userId,
        playerName: gameEntry.playerName,
        administratorFlag: gameEntry.administratorFlag,
      });
      // ゲーム参加者を登録
      await this.gameEntryRepository.createGameEntry(entry, manager);
    });
  }


  // maoyagi ver
  
}

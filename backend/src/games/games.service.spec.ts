import { Test } from '@nestjs/testing';
import { GamesService } from './games.service';
import { GameRoomRepository } from './gameRoom.repository';
import { ListGameRoomsRequestDto } from './dto/request/listGameRoomsRequest.dto';
import { GAME_ROOM_STATUS } from './game.constant';
import { InternalServerErrorException } from '@nestjs/common';
import { GameRoom } from './entities/gameRoom.entity';

const mockGameRoomRepository = (): Partial<GameRoomRepository> => ({
  findManyGameRooms: jest.fn() as jest.Mock<Promise<[GameRoom[], number]>>,
  countGameRooms: jest.fn() as jest.Mock<Promise<number>>,
});

describe('GamesService', () => {
  let gamesService: GamesService;
  let gameRoomRepository: GameRoomRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GamesService,
        { provide: GameRoomRepository, useFactory: mockGameRoomRepository },
      ],
    }).compile();

    gamesService = module.get<GamesService>(GamesService);
    gameRoomRepository = module.get<GameRoomRepository>(GameRoomRepository);
  });

  describe('listGameRooms', () => {
    it('ゲームルーム一覧を取得して返却する', async () => {
      gameRoomRepository.findManyGameRooms.mockResolvedValue([[{}, {}], 2]);
      gameRoomRepository.countGameRooms.mockResolvedValue(10);

      const requestDto: ListGameRoomsRequestDto = {
        'room-name': 'test',
        'room-status': GAME_ROOM_STATUS.WAITING,
        'take-count': 10,
        'page-number': 1,
      };
      const result = await gamesService.listGameRooms(requestDto);

      expect(result.pagination.total).toEqual(2);
      expect(result.pagination.perPage).toEqual(2);
      expect(gameRoomRepository.findManyGameRooms).toHaveBeenCalledWith(
        {
          roomName: requestDto['room-name'],
          roomStatus: requestDto['room-status'],
        },
        {
          take: requestDto['take-count'],
          skip: (requestDto['page-number'] - 1) * requestDto['take-count'],
        },
      );
    });
    it('ゲームルームの取得結果が空の場合', async () => {
      gameRoomRepository.findManyGameRooms.mockResolvedValue([[], 0]);
      gameRoomRepository.countGameRooms.mockResolvedValue(0);

      const requestDto: ListGameRoomsRequestDto = {
        'room-name': 'test',
        'room-status': GAME_ROOM_STATUS.WAITING,
        'take-count': 10,
        'page-number': 1,
      };
      const result = await gamesService.listGameRooms(requestDto);

      expect(result.result).toHaveLength(0);
      expect(result.pagination.total).toEqual(0);
      expect(result.pagination.perPage).toEqual(0);
    });
    it('データベース接続エラー', async () => {
      gameRoomRepository.findManyGameRooms.mockRejectedValue(new InternalServerErrorException());

      const requestDto: ListGameRoomsRequestDto = {
        'room-name': 'test',
        'room-status': GAME_ROOM_STATUS.WAITING,
        'take-count': 10,
        'page-number': 1,
      };

      await expect(gamesService.listGameRooms(requestDto)).rejects.toThrow();
      expect(gameRoomRepository.findManyGameRooms).toHaveBeenCalled();
    });
  });
});

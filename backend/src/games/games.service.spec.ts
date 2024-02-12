import { GamesService } from './games.service';
import { GameRoomRepository } from './gameRoom.repository';
import { ListGameRoomsRequestDto } from './dto/request/listGameRoomsRequest.dto';
import { GAME_ROOM_STATUS } from './game.constant';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { GameEntryRepository } from './gameEntry.repository';
import { DataSource } from 'typeorm';

const mockGameRoomRepository = {
  findOneGameRoomForUpdate: jest.fn(),
  findManyGameRooms: jest.fn(),
  countGameRooms: jest.fn(),
  createGameRoom: jest.fn(),
};

const mockGameEntryRepository = {
  createGameEntry: jest.fn(),
  findManyGameEntries: jest.fn(),
};

const mockEntityManager = {
  save: jest.fn(),
  create: jest.fn(),
};

const mockDataSource = {
  getRepository: jest.fn(),
  transaction: jest.fn(),
};

describe('GamesService', () => {
  let gamesService: GamesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockEntityManager.save.mockResolvedValue({});
    mockEntityManager.create.mockReturnValue({});
    mockDataSource.transaction.mockImplementation(async (callback) => {
      await callback(mockEntityManager);
    });
    gamesService = new GamesService(
      mockGameRoomRepository as unknown as GameRoomRepository,
      mockGameEntryRepository as unknown as GameEntryRepository,
      mockDataSource as unknown as DataSource,
    );
  });

  describe('listGameRooms', () => {
    it('ゲームルーム一覧を取得して返却する', async () => {
      mockGameRoomRepository.findManyGameRooms.mockResolvedValue([[{}, {}], 2]);
      mockGameRoomRepository.countGameRooms.mockResolvedValue(10);

      const requestDto: ListGameRoomsRequestDto = {
        'room-name': 'test',
        'room-status': GAME_ROOM_STATUS.WAITING,
        'take-count': 10,
        'page-number': 1,
      };
      const result = await gamesService.listGameRooms(requestDto);

      expect(result.pagination.total).toEqual(2);
      expect(result.pagination.perPage).toEqual(2);
      expect(mockGameRoomRepository.findManyGameRooms).toHaveBeenCalledWith(
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
    it('ゲームルーム一覧を取得（レコードが空）', async () => {
      mockGameRoomRepository.findManyGameRooms.mockResolvedValue([[], 0]);
      mockGameRoomRepository.countGameRooms.mockResolvedValue(0);

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
      mockGameRoomRepository.findManyGameRooms.mockRejectedValue(
        new InternalServerErrorException(),
      );

      const requestDto: ListGameRoomsRequestDto = {
        'room-name': 'test',
        'room-status': GAME_ROOM_STATUS.WAITING,
        'take-count': 10,
        'page-number': 1,
      };

      await expect(gamesService.listGameRooms(requestDto)).rejects.toThrow();
      expect(mockGameRoomRepository.findManyGameRooms).toHaveBeenCalled();
    });
  });

  describe('createGameRoom', () => {
    it('ゲームルームを登録する', async () => {
      mockGameRoomRepository.createGameRoom.mockImplementation((gameRoom, _manager) =>
        Promise.resolve(gameRoom),
      );
      mockGameEntryRepository.createGameEntry.mockImplementation((gameEntry, _manager) =>
        Promise.resolve(gameEntry),
      );

      const requestDto = {
        roomName: 'room1',
        note: 'note',
        maxPlayers: 10,
        createUserId: 1,
        playerName: 'John Doe',
      };

      await expect(gamesService.createGameRoom(requestDto)).resolves.toBeUndefined();
    });
  });

  describe('createGameEntry', () => {
    it('ゲーム参加者を登録する', async () => {
      mockGameRoomRepository.findOneGameRoomForUpdate.mockResolvedValue({
        gameRoomId: 1,
        maxPlayers: 2,
      });
      mockGameEntryRepository.findManyGameEntries.mockResolvedValue([]);
      mockGameEntryRepository.createGameEntry.mockImplementation((gameRoom, _manager) =>
        Promise.resolve(gameRoom),
      );
      const gameRoomId = 1;
      const inputDto = {
        gameRoomId: 1,
        userId: 1,
        playerName: 'test',
        administratorFlag: false,
      };
      await expect(gamesService.createGameEntry(inputDto)).resolves.toBeUndefined();
      expect(mockGameRoomRepository.findOneGameRoomForUpdate).toHaveBeenCalledWith(
        gameRoomId,
        expect.anything(),
      );
      expect(mockGameEntryRepository.findManyGameEntries).toHaveBeenCalledWith(
        gameRoomId,
        expect.anything(),
      );
    });
    it('ゲーム参加者を登録（最大人数に達している場合）', async () => {
      mockGameRoomRepository.findOneGameRoomForUpdate({
        gameRoomId: 1,
        maxPlayers: 2,
      });
      mockGameEntryRepository.findManyGameEntries.mockResolvedValue([{}, {}]);
      const gameRoomId = 1;
      const inputDto = {
        gameRoomId: 1,
        userId: 1,
        playerName: 'test',
        administratorFlag: false,
      };
      await expect(gamesService.createGameEntry(inputDto)).rejects.toThrow(BadRequestException);
      expect(mockGameRoomRepository.findOneGameRoomForUpdate).toHaveBeenCalledWith(
        gameRoomId,
        expect.anything(),
      );
      expect(mockGameEntryRepository.findManyGameEntries).toHaveBeenCalledWith(
        gameRoomId,
        expect.anything(),
      );
    });
  });
});

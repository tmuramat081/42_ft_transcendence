import { Test } from '@nestjs/testing';
import { GamesService } from './games.service';
import { GameRoomRepository } from './gameRoom.repository';
import { ListGameRoomsRequestDto } from './dto/request/listGameRoomsRequest.dto';
import { GAME_ROOM_STATUS } from './game.constant';
import { InternalServerErrorException } from '@nestjs/common';
import { GameEntryRepository } from './gameEntry.repository';
import { JwtAuthGuard } from '@/users/guards/jwt-auth.guard';
import { MockJwtAuthGuard } from '@/users/guards/mock-jwt-auth.guard';
import { DataSource, EntityManager } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@/users/entities/user.entity';

const mockGameRoomRepository = (): Partial<GameRoomRepository> => ({
  findManyGameRooms: jest.fn(),
  countGameRooms: jest.fn(),
  createGameRoom: jest.fn(),
});

const mockGameEntryRepository = (): Partial<GameEntryRepository> => ({
  createGameEntry: jest.fn(),
});

const mockUserRepository = () => ({
  findOne: jest.fn().mockResolvedValue({ userId: 1 }),
});

type TransactionCallback<T> = (entityManager: EntityManager) => Promise<T>;
const mockDataSource = {
  transaction: jest
    .fn()
    .mockImplementation(async <T>(transactionCallback: TransactionCallback<T>) => {
      const entityManagerMock = {
        getRepository: jest.fn().mockImplementation(() => ({
          save: jest.fn().mockResolvedValue({}),
        })),
      } as unknown as EntityManager;
      return await transactionCallback(entityManagerMock);
    }),
};

describe('GamesService', () => {
  let gamesService: GamesService;
  let gameRoomRepository: GameRoomRepository;
  let gameEntryRepository: GameEntryRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GamesService,
        { provide: GameRoomRepository, useFactory: mockGameRoomRepository },
        { provide: GameEntryRepository, useFactory: mockGameEntryRepository },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    gamesService = module.get<GamesService>(GamesService);
    gameRoomRepository = module.get<GameRoomRepository>(GameRoomRepository);
    gameEntryRepository = module.get<GameEntryRepository>(GameEntryRepository);
  });

  describe('listGameRooms', () => {
    it('ゲームルーム一覧を取得して返却する', async () => {
      (gameRoomRepository.findManyGameRooms as jest.Mock).mockResolvedValue([[{}, {}], 2]);
      (gameRoomRepository.countGameRooms as jest.Mock).mockResolvedValue(10);

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
    it('ゲームルーム一覧を取得（レコードが空）', async () => {
      (gameRoomRepository.findManyGameRooms as jest.Mock).mockResolvedValue([[], 0]);
      (gameRoomRepository.countGameRooms as jest.Mock).mockResolvedValue(0);

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
      (gameRoomRepository.findManyGameRooms as jest.Mock).mockRejectedValue(
        new InternalServerErrorException(),
      );

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

  describe('createGameRoom', () => {
    it('ゲームルームを登録する', async () => {
      (gameRoomRepository.createGameRoom as jest.Mock).mockImplementation((gameRoom, _manager) =>
        Promise.resolve(gameRoom),
      );
      (gameEntryRepository.createGameEntry as jest.Mock).mockImplementation((gameEntry, _manager) =>
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
      expect(mockUserRepository().findOne).toHaveBeenCalledWith({
        where: { userId: requestDto.createUserId },
      });
      expect(mockGameRoomRepository().createGameRoom).toHaveBeenCalled();
      expect(mockGameEntryRepository().createGameEntry).toHaveBeenCalled();
    });
  });
});

import { ListGameRoomsRequestDto } from './dto/request/listGameRoomsRequest.dto';
import { ListGameRoomsResponseDto } from './dto/response/listGameRoomResponse.dto';
import { GAME_ROOM_STATUS } from './game.constant';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('GamesController', () => {
  let controller: GamesController;
  let service: GamesService;

  beforeEach(async () => {
    const mockGameService = {
      listGameRooms: jest.fn().mockResolvedValue({
        result: [],
        pagination: {},
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: GamesService,
          useValue: mockGameService,
        },
      ],
    }).compile();

    controller = module.get<GamesController>(GamesController);
    service = module.get<GamesService>(GamesService);
  });

  it('ゲームルーム一覧取得', async () => {
    const requestDto: ListGameRoomsRequestDto = {
      'room-name': 'test',
      'room-status': GAME_ROOM_STATUS.WAITING,
      'take-count': 10,
      'page-number': 1,
    };
    await expect(controller.listGameRooms(requestDto)).resolves.toBeInstanceOf(
      ListGameRoomsResponseDto,
    );

    jest.spyOn(service, 'listGameRooms').mockImplementation(async () => ({
      result: [],
      pagination: {
        total: 0,
        currentPage: 1,
        perPage: 0,
      },
    }));

    await expect(controller.listGameRooms(requestDto)).resolves.toBeInstanceOf(
      ListGameRoomsResponseDto,
    );
    expect(service.listGameRooms).toHaveBeenCalledWith(requestDto);
  });
});

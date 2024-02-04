import { Controller, Get, Query } from '@nestjs/common';
import { GamesService } from './games.service';
import { ListGameRoomsRequestDto } from './dto/request/listGameRoomsRequest.dto';
import { ListGameRoomsResponseDto } from './dto/response/listGameRoomResponse.dto';

// TODO: JWTガード追加
@Controller('game-room')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  // ゲームルーム一覧取得API
  @Get('')
  async listGameRooms(
    @Query() listGameRoomsRequestDto: ListGameRoomsRequestDto,
  ) {
    const { result, pagination } = await this.gamesService.listGameRooms(
      listGameRoomsRequestDto,
    );
    return new ListGameRoomsResponseDto(result, pagination);
  }
}

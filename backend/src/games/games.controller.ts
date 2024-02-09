import { Controller, Get, Query } from '@nestjs/common';
import { GamesService } from './games.service';
import { ListGameRoomsRequestDto } from './dto/request/listGameRoomsRequest.dto';
import { ListGameRoomsResponseDto } from './dto/response/listGameRoomResponse.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

// TODO: JWTガード追加

@ApiTags('GameRoom')
@Controller('game-room')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  // ゲームルーム一覧取得API
  @Get('')
  @ApiOperation({
    summary: 'ゲームルーム一覧取得API',
    description: '登録されているゲームルームの一覧を取得する。',
  })
  @ApiResponse({ status: 200, type: ListGameRoomsResponseDto })
  async listGameRooms(@Query() listGameRoomsRequestDto: ListGameRoomsRequestDto) {
    const { result, pagination } = await this.gamesService.listGameRooms(listGameRoomsRequestDto);
    return new ListGameRoomsResponseDto(result, pagination);
  }
}

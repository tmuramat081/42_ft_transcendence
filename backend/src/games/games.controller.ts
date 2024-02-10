import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GamesService } from './games.service';
import { ListGameRoomsRequestDto } from './dto/request/listGameRoomsRequest.dto';
import { ListGameRoomsResponseDto } from './dto/response/listGameRoomResponse.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateGameRoomRequestDto } from './dto/request/createGameRoomRequest.dto';

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

  // ゲームルーム登録API
  @Post('')
  @ApiOperation({
    summary: 'ゲームルーム登録API',
    description: 'ルームを登録し、ログインユーザーをルームに参加させる。',
  })
  @ApiResponse({ status: 201 })
  async createGameRoom(@Body() createGameRoomRequestDto: CreateGameRoomRequestDto) {
    await this.gamesService.createGameRoom(createGameRoomRequestDto);
  }
}

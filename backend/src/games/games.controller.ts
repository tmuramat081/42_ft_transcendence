import { Controller } from '@nestjs/common';

// JWTガード追加
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  /**
   * 試合結果一覧取得API
   */
  @Get('')
  listGameResult(@Req() req) {
    
  }

}
import { Controller } from '@nestjs/common';
import { GamesService } from './games.service';

// JWTガード追加
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}
}

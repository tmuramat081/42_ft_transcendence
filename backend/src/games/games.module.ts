import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntry } from './entities/gameEntry.entity';
import { GameRoom } from './entities/gameRoom.entity';
import { Match } from 'src/users/dto/match.decorator';
import { MatchResult } from './entities/matchResult.entity';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GameRoomRepository } from './gameRoom.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameRoom, GameEntry, Match, MatchResult]),
  ],
  controllers: [GamesController],
  providers: [GamesService, GameRoomRepository],
  exports: [GamesService],
})
export class GameModule {}

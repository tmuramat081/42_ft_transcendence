import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntry } from './entities/gameEntry.entity';
import { GameRoom } from './entities/gameRoom.entity';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GameRoomRepository } from './gameRoom.repository';
import { GameEntryRepository } from './gameEntry.repository';
import { UserRepository } from '@/users/users.repository';
import { User } from '@/users/entities/user.entity';
import { UsersModule } from '@/users/users.module';
import { MatchResult } from './entities/matchResult.entity';
import { Match } from '@/users/dto/match.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([User, GameRoom, GameEntry, Match, MatchResult]), UsersModule],
  controllers: [GamesController],
  providers: [GamesService, GameRoomRepository, GameEntryRepository, UserRepository],
  exports: [GamesService],
})
export class GameModule {}

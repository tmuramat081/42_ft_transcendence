import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntry } from './entities/gameEntry.entity';
import { GameRoom } from './entities/gameRoom.entity';
import { Match } from 'src/users/dto/match.decorator';
import { MatchResult } from './entities/matchResult.entity';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GameRoomRepository } from './gameRoom.repository';
import { GameEntryRepository } from './gameEntry.repository';
import { UserRepository } from '@/users/users.repository';
import { User } from '@/users/entities/user.entity';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([GameRoom, GameEntry, Match, MatchResult, User]), UsersModule],
  controllers: [GamesController],
  providers: [GamesService, GameRoomRepository, GameEntryRepository, UserRepository],
  exports: [GamesService, GameRoomRepository, GameEntryRepository],
})
export class GameModule {}

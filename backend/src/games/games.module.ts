import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntry } from './entities/gameEntry.entity';
import { GameRoom } from './entities/gameRoom.entity';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GameRoomRepository } from './gameRoom.repository';
import { GameEntryRepository } from './gameEntry.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GameRoom, GameEntry])],
  controllers: [GamesController],
  providers: [GamesService, GameRoomRepository, GameEntryRepository],
  exports: [GamesService, GameRoomRepository, GameEntryRepository],
})
export class GameModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule, getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { GameEntry } from './entities/gameEntry.entity';
import { GameRoom } from './entities/gameRoom.entity';
import { GamesController } from './games.controller';
import { customGameRoomRepository } from './gameRoom.repository';
import { GamesService } from './games.service';
import { DataSource } from 'typeorm';
import { customGameEntryRepository } from './gameEntry.repository';
import { GameGateway } from './gateway/game.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([GameRoom, GameEntry])],
  controllers: [GamesController],
  providers: [
    {
      provide: getRepositoryToken(GameRoom),
      inject: [getDataSourceToken()],
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(GameRoom).extend(customGameRoomRepository),
    },
    {
      provide: getRepositoryToken(GameEntry),
      inject: [getDataSourceToken()],
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(GameEntry).extend(customGameEntryRepository),
    },
    GamesService,
    GameGateway,
  ],
  exports: [GameModule, GamesService],
})
export class GameModule {}

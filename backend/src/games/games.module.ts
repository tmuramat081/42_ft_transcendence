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
import { RecordsRepository } from './gameRecord.repository';
import { UsersService } from '@/users/users.service';
import { AuthService } from '@/auth/auth.service';
import { GameRecord } from './entities/gameRecord.entity';
import { User } from '@/users/entities/user.entity';
import { UserRepository } from '@/users/users.repository';
import { UsersModule } from '@/users/users.module';
import { AuthModule } from '@/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([GameRoom, GameEntry, GameRecord, User])],
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
        dataSource.getRepository(GameEntry).extend(RecordsRepository),
    },
    // {
    //   provide: getRepositoryToken(GameRecord),
    //   inject: [getDataSourceToken()],
    //   useFactory: (dataSource: DataSource) =>
    //     dataSource.getRepository(GameRecord).extend(RecordsRepository),
    // },
    GamesService,
    GameGateway,
    RecordsRepository,
    UserRepository,
    UsersService,
    AuthService,
    UsersModule,
    JwtModule,
    JwtService,
  ],
  exports: [GameModule, GamesService, RecordsRepository, UsersService, AuthService, UserRepository, JwtModule, JwtService],
})
export class GameModule {}

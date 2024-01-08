import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [
    TypeOrmModule.forFeature([Game]),
  ],
  controllers: [GamesController],
  providers: [GamesService, GameRepository],
  exports: [GamesService],
})
export class GameModule {}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { GameRoom } from '../../games/entities/gameRoom.entity';
import { GAME_ROOM_STATUS } from '../../games/game.constant';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class GameRoomSeeder implements Seeder {
  constructor(
    @InjectRepository(GameRoom)
    private gameRoomRepository: Repository<GameRoom>,
  ) {}

  seed(): Promise<GameRoom[]> {
    const dummyData = [];
    for (let i = 0; i < 10; i++) {
      const status =
        i % 3 === 0
          ? GAME_ROOM_STATUS.WAITING
          : i % 3 === 1
            ? GAME_ROOM_STATUS.STARTED
            : GAME_ROOM_STATUS.FINISHED;
      const datum = this.gameRoomRepository.create({
        roomName: `ゲームルーム${i + 1}`,
        note: `テスト用ゲームルーム${i + 1}`,
        maxPlayers: 2,
        roomStatus: status,
        createdBy: 1,
      });
      dummyData.push(datum);
    }
    return this.gameRoomRepository.save(dummyData as GameRoom[]);
  }

  drop(): Promise<DeleteResult> {
    // reset auto-increment
    void this.gameRoomRepository.query(`
      SELECT SETVAL ('game_room_game_room_id_seq', 1, false)
    `);
    return this.gameRoomRepository.delete({});
  }
}

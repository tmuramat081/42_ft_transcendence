import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { GameRoom } from '../..//games/entities/gameRoom.entity';
import { GAME_ROOM_STATUS } from '../../games/game.constant';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class GameRoomSeeder implements Seeder {
  constructor(
    @InjectRepository(GameRoom)
    private gameRoomRepository: Repository<GameRoom>,
  ) {}

  seed(): Promise<GameRoom[]> {
    const gameRooms = this.gameRoomRepository.create([
      {
        roomName: 'ゲームルーム1',
        note: 'テスト用ゲームルーム1',
        maxPlayers: 2,
        roomStatus: GAME_ROOM_STATUS.WAITING,
        createdBy: 1,
      },
      {
        roomName: 'ゲームルーム2',
        note: 'テスト用ゲームルーム2',
        maxPlayers: 2,
        roomStatus: GAME_ROOM_STATUS.STARTED,
        createdBy: 1,
      },
      {
        roomName: 'ゲームルーム3',
        note: 'テスト用ゲームルーム3',
        maxPlayers: 2,
        roomStatus: GAME_ROOM_STATUS.FINISHED,
        createdBy: 1,
      },
    ]);
    return this.gameRoomRepository.save(gameRooms);
  }

  drop(): Promise<DeleteResult> {
    // reset auto-increment
    this.gameRoomRepository.query(
      `SELECT SETVAL ('game_room_game_room_id_seq', 1, false)`,
    );
    return this.gameRoomRepository.delete({});
  }
}

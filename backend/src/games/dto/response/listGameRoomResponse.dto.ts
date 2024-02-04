import { Valueof } from '@/common/types/global';
import { GameRoom } from '../../entities/gameRoom.entity';
import { IPaginationEnvelope } from '@/common/interface/pagination';
import { GAME_ROOM_STATUS } from '@/games/game.constant';

export class ListGameRoomsResponseDto {
  readonly results!: GameRoomResult[];
  readonly pagination: IPaginationEnvelope;

  constructor(gameRooms: GameRoom[], pagination: IPaginationEnvelope) {
    this.results = gameRooms.map((gameRoom) => {
      return new GameRoomResult(gameRoom);
    });
    this.pagination = pagination;
  }
}

class GameRoomResult {
  readonly gameRoomId: number;
  readonly roomName: string;
  readonly note?: string;
  readonly maxPlayers: number;
  readonly roomStatus: Valueof<typeof GAME_ROOM_STATUS>;
  readonly createdBy: number;
  readonly createdAt: Date;

  constructor(gameRoom: GameRoom) {
    this.gameRoomId = gameRoom.gameRoomId;
    this.roomName = gameRoom.roomName;
    this.note = gameRoom.note;
    this.maxPlayers = gameRoom.maxPlayers;
    this.roomStatus = gameRoom.roomStatus;
    this.createdBy = gameRoom.createdBy;
    this.createdAt = gameRoom.createdAt;
  }
}

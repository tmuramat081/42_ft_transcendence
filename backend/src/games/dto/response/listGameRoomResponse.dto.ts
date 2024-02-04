import { Valueof } from '@/common/types/global';
import { GameRoom } from '../../entities/gameRoom.entity';
import { IPaginationEnvelope } from '@/common/interface/pagination';
import { GAME_ROOM_STATUS } from '@/games/game.constant';
import { ApiProperty } from '@nestjs/swagger';

class GameRoomResult {
  @ApiProperty()
  readonly gameRoomId: number;
  @ApiProperty()
  readonly roomName: string;
  @ApiProperty()
  readonly note?: string;
  @ApiProperty()
  readonly maxPlayers: number;
  @ApiProperty()
  readonly roomStatus: Valueof<typeof GAME_ROOM_STATUS>;
  @ApiProperty()
  readonly createdBy: number;
  @ApiProperty()
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

export class ListGameRoomsResponseDto {
  @ApiProperty({ type: [GameRoomResult] })
  readonly results!: GameRoomResult[];

  @ApiProperty()
  readonly pagination: IPaginationEnvelope;

  constructor(gameRooms: GameRoom[], pagination: IPaginationEnvelope) {
    this.results = gameRooms.map((gameRoom) => {
      return new GameRoomResult(gameRoom);
    });
    this.pagination = pagination;
  }
}


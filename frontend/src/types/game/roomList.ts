import { GAME_ROOM_STATUS } from '@/constants/game.constant';
import { Valueof } from '../common/global';

export type ListGameRoomResponse = {
  results: GameRoom[];
  pagination: Pagination;
};

export type GameRoom = {
  gameRoomId: number;
  roomName: string;
  note: string | null;
  maxPlayers: number;
  roomStatus: Valueof<typeof GAME_ROOM_STATUS>;
  createdBy: string;
  createdAt: string;
};

export type Pagination = {
  total: number;
  perPage: number;
  currentPage: number;
};

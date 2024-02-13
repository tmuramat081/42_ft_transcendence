'use client';
import { TO_LOCALE_STRING_OPTIONS } from '@/constants/date.contant';
import { GameRoom } from '@/types/game/roomList';
import { Card, CardContent } from '@mui/material';
import { GAME_ROOM_STATUS } from '../../../../../../backend/src/games/game.constant';
import { Valueof } from '../../../../../../backend/src/common/types/global';

export type Props = {
  gameRoom: GameRoom;
  onClick: () => void;
};

const convertDateFormat = (date: string) => {
  return new Date(date).toLocaleString('ja-JP', TO_LOCALE_STRING_OPTIONS['YYYY/MM/DD_hh:mm']);
};

const convertStatusFormat = (status: Valueof<typeof GAME_ROOM_STATUS>) => {
  switch (status) {
    case GAME_ROOM_STATUS.WAITING:
      return '募集中';
    case GAME_ROOM_STATUS.STARTED:
      return 'プレイ中';
    case GAME_ROOM_STATUS.FINISHED:
      return '終了';
    default:
      return '';
  }
};

export default function GameRoomCard({ gameRoom, onClick }: Props) {
  return (
    <Card variant="outlined">
      <CardContent onClick={onClick}>
        <h3>{gameRoom.roomName}</h3>
        <p>{gameRoom.note}</p>
        <div>
          <label>
            参加者：
            {0}/{gameRoom.maxPlayers}
          </label>
        </div>
        <div>
          <label>
            ステータス：
            {convertStatusFormat(gameRoom.roomStatus)}
          </label>
        </div>
        <div>
          <label>
            作成日：
            {convertDateFormat(gameRoom.createdAt)}
          </label>
        </div>
      </CardContent>
    </Card>
  );
}

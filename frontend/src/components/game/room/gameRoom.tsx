'use client';
import PongDemo from '../PongDemo';
import GameLog from './gameLog';
import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import UseGameConnection from './hooks/useGameRoomConnect';

type Props = {
  roomId: number;
  userId: number;
};

/**
 * ゲームルーム画面
 */
export default function GameRoom({ roomId, userId }: Props) {
  // ルーティング
  const router = useRouter();

  // ゲーム接続情報のフック
  const { gameStarted, users, logs } = UseGameConnection({ roomId, userId });

  return (
    <>
      <h2>ゲームルーム</h2>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          router.back();
        }}
      >
        ルーム退室
      </Button>
      {!gameStarted ? (
        <p>ゲームを開始するには、相手プレイヤーの入室を待ってください。</p>
      ) : (
        <section>
          <PongDemo
            title={'Pong Game'}
            width={800}
            height={400}
          />
        </section>
      )}
      <aside style={{ width: '300px' }}>
        <h3>ゲームログ</h3>
        <GameLog
          users={users}
          logs={logs}
        />
      </aside>
    </>
  );
}

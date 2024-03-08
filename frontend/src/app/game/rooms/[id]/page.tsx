'use client';
import GameRoom from '@/components/game/room/gameRoom';
import { useParams } from 'next/navigation';

export default function Page() {
  // ルームIDを取得
  const params = useParams();
  const roomId = Number(params.id);

  if (!roomId) return <></>;

  return (
    <main style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <GameRoom
          roomId={roomId}
          userId={1}
        />
      </div>
    </main>
  );
}

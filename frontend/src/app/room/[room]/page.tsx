'use client';

import RoomPage from '@/components/chat/roomPage/roomPage';
import { useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();
  const room = Array.isArray(params.room) ? params.room[0] : params.room;

  return (
    <article>
      <h2>Room Page</h2>
      <section>
        <RoomPage params={room} />
      </section>
    </article>
  );
}

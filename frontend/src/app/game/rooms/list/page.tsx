'use client';

import RoomList from '@/components/game/roomList/roomList';
import { useAuth } from '@/providers/useAuth';
import { useEffect } from 'react';

export default function Page() {
  const { loginUser, getCurrentUser, loading } = useAuth();

  useEffect(() => {
    getCurrentUser();
  }, []);

  if (loading || !loginUser) {
    return <p></p>;
  }

  return (
    <article>
      <section>
        <p>ルーム一覧</p>
      </section>
      <section>
        <RoomList
          user={loginUser}
        />
      </section>
    </article>
  );
}

import { useAsyncEffect } from '@/hooks/effect/useAsyncEffect';
import { useAuth } from '@/providers/useAuth';
import { User } from '@/types/user';
import { useEffect, useState } from 'react';

export default function FriendList() {
  const { loginUser, getCurrentUser } = useAuth();
  const [friendList, setFriendList] = useState<User[]>([]);

  useEffect(() => {
    if (loginUser) {
      setFriendList(loginUser.friends);
    }
  }, [loginUser]);

  useAsyncEffect(async () => {
    await getCurrentUser();
  }, []);

  return (
    <div>
      <h2>Friend List</h2>
      {friendList.map((friend) => (
        <div key={friend.userId}>{friend.userName}</div>
      ))}
    </div>
  );
}

import { useState } from 'react';
import { FriendList as FL } from '../users/FriendList';
import { User } from '@/types/user';

type Props = {
  user: User;
};

export default function FriendList({ user }: Props) {
  const [friendList, setFriendList] = useState<User[]>([]);

  return (
    <FL friends={friendList} user={user} />
  );
}

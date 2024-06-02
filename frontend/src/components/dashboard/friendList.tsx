import { useAsyncEffect } from '@/hooks/effect/useAsyncEffect';
import { useAuth } from '@/providers/useAuth';
import { User } from '@/types/user';
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import useApi from '@/hooks/httpClient/useApi';

export default function FriendList() {
  const { loginUser, getCurrentUser } = useAuth();
  const [friendList, setFriendList] = useState<User[]>([]);

  useEffect(() => {
    if (loginUser) {
      setFriendList(loginUser.friends);
      // console.log(loginUser.friends);
    }
  }, [loginUser]);

  useAsyncEffect(async () => {
    // console.log('get friend list');
    await getCurrentUser();
  }, []);

  return (
    <Box sx={{ px: 2, py: 4 }}>
      <h2>Friend List</h2>
      {friendList.length === 0 ? (
        <Box>No friends</Box>
      ) : (
        <Box>
          {friendList.map((friend) => (
            <Box key={friend.userId}>{friend.userName}</Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

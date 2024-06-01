import { useAsyncEffect } from '@/hooks/effect/useAsyncEffect';
import UserProfileCard from '@/components/users/list/userCard';
import { useAuth } from '@/providers/useAuth';
import { useEffect, useState } from 'react';
import { User } from '@/types/user';
import { Grid, Box } from '@mui/material';

export default function UserProfile() {
  const { loginUser, getCurrentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (loginUser) {
      setUser(loginUser);
      console.log(loginUser);
    }
  }, [loginUser]);

  useAsyncEffect(async () => {
    await getCurrentUser();
  }, []);

  if (!user) return null;

  return (
    <Box sx={{ px: 2, py: 4 }}>
      <h2>User Profile</h2>
      <UserProfileCard user={user} />
    </Box>
  );
}

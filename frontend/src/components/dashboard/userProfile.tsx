import { useAsyncEffect } from '@/hooks/effect/useAsyncEffect';
import { useAuth } from '@/providers/useAuth';
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { Avatar, Card, CardHeader, Typography } from '@mui/material';
import UserDetailModal from '@/components/users/list/detailModal';
import { User } from '@/types/user';

// const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function UserProfile() {
  const { loginUser, getCurrentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [showUserDetailModal, setShowUserDetailModal] = useState<boolean>(false);

  const handleOpenDetailModal = () => {
    setShowUserDetailModal(true);
  };

  useEffect(() => {
    if (loginUser) {
      setUser(loginUser);
    }
  }, [loginUser]);

  useAsyncEffect(async () => {
    await getCurrentUser();
  }, []);

  if (!user) return null;

  return (
    <Box sx={{ px: 2, py: 4 }}>
      <Typography variant="h4">Your Profile</Typography>
      <Card>
        <CardHeader
          avatar={
            <Avatar
              src={`${API_URL}/api/uploads/${user.icon}`}
              sx={{ width: 50, height: 50 }}
            />
          }
          title={`${user.userId} ${user.userName}`}
          subheader={user.email}
        />
      </Card>
      <UserDetailModal
        userName={user.userName}
        open={showUserDetailModal}
        onClose={() => setShowUserDetailModal(false)}
      />
    </Box>
  );

}

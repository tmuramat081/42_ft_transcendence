import { useAsyncEffect } from '@/hooks/effect/useAsyncEffect';
import { useAuth } from '@/providers/useAuth';
import { useEffect, useState } from 'react';
import { User } from '@/types/user';
import { Box } from '@mui/material';
import { Avatar, Button, Card, CardActions, CardHeader } from '@mui/material';
import UserDetailModal from '@/components/users/list/detailModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';


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
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={handleOpenDetailModal}>フレンド追加</Button>
        </CardActions>
      </Card>
      <UserDetailModal
        userName={user.userName}
        open={showUserDetailModal}
        onClose={() => setShowUserDetailModal(false)}
      />

    </Box>
  );

}

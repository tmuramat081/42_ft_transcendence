import { FindUsersResponse } from '@/types/user/findUsers';
import { Avatar, Button, Card, CardActions, CardHeader } from '@mui/material';
import { useState } from 'react';
import UserDetailModal from './detailModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

type Props = {
  user: FindUsersResponse;
};

/**
 * プロフィールカード
 */
export default function UserProfileCard({ user }: Props) {
  const [showUserDetailModal, setShowUserDetailModal] = useState<boolean>(false);
  const handleOpenDetailModal = () => {
    setShowUserDetailModal(true);
  };

  return (
    <>
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
    </>
  );
}

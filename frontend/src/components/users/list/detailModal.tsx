'use client';
import { HTTP_METHOD } from '@/constants/api.constant';
import { useAsyncEffect } from '@/hooks/effect/useAsyncEffect';
import useApi from '@/hooks/httpClient/useApi';
import { FindUsersResponse } from '@/types/user/findUsers';
import { Modal, Box, Button, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';

// const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type Props = {
  userName: string;
  open: boolean;
  onClose: () => void;
};

export default function UserDetailModal({ userName, open, onClose }: Props) {
  const { fetchData: addFriend } = useApi({
    path: `users/friend/add/${userName}`,
    method: HTTP_METHOD.POST,
  });

  const handleAddFriend = async () => {
    try {
      await addFriend();
    } catch (error) {
      console.error(error);
    } finally {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <Box
        sx={{
          position: 'absolute',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: '10px',
          p: 4,
        }}
      >
        <Typography
          variant="h6"
        >
          Add to Friend List?
        </Typography>
        <Typography
          variant="body1"
        >
          {userName}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddFriend}
        >
          ADD
        </Button>
      </Box>
    </Modal>
  );
}

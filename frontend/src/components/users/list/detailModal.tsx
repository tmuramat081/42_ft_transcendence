'use client';
import { HTTP_METHOD } from '@/constants/api.constant';
import { useAsyncEffect } from '@/hooks/effect/useAsyncEffect';
import useApi from '@/hooks/httpClient/useApi';
import { FindUsersResponse } from '@/types/user/findUsers';
import { Modal } from '@mui/material';
import Avatar from '@mui/material/Avatar';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

type Props = {
  userName: string;
  open: boolean;
  onClose: () => void;
};

export default function UserDetailModal({ userName, open, onClose }: Props) {
  const { data: user, fetchData: fetchListUser } = useApi<FindUsersResponse>({
    path: `users/${userName}`,
    method: HTTP_METHOD.GET,
  });

  useAsyncEffect(async () => {
    try {
      await fetchListUser();
    } catch (error) {
      console.error(error);
    }
  }, [userName]);

  if (!user) {
    return (
      <div>
        <h1>ユーザーが見つかりません</h1>
      </div>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <div>
        <h1>{user.userName}</h1>
        <p>{user.email}</p>
        <p>{user.userId}</p>
        <p>{user.icon}</p>
        <Avatar
          alt={user.userName}
          src={`${API_URL}/api/uploads/${user.icon}`}
        />
      </div>
    </Modal>
  );
}

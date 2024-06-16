'use client';
import { Avatar, Button, Card, CardActions, CardHeader } from '@mui/material';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

type Props = {
  user: FindUsersResponse;
};

/**
 * プロフィールカード
 */
export default function UserProfileCard({ user }: Props) {
  const router = useRouter();

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
          <Button onClick={() => {
            router.push(`/users/${user.userName}`);
          }}>DETAIL</Button>
        </CardActions>
      </Card>
    </>
  );
}

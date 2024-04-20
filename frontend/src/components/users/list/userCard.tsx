import { FindUsersResponse } from '@/types/user/findUsers';
import { Avatar, Button, Card, CardActions, CardHeader } from '@mui/material';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

type Props = {
  user: FindUsersResponse;
};

/**
 * プロフィールカード
 */
export default function UserProfileCard({ user }: Props) {
  return (
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
        <Button
          href={`/friend/${user.userName}`}
          size="small"
        >
          フレンド追加
        </Button>
      </CardActions>
    </Card>
  );
}

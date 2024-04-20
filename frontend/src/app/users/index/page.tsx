// サーバーサイドでの処理
import UserProfileList from '@/components/users/list/userList';
import { FindUsersResponse } from '@/types/user/findUsers';
import { Box } from '@mui/material';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export default async function Page() {
  let users: FindUsersResponse[] = [];
  try {
    const response = await fetch(`${API_URL}/users/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      cache: 'no-store',
    });
    users = ((await response.json()) as { users: FindUsersResponse[] }).users;
  } catch (error) {
    console.error(error);
  }

  if (!users || users.length === 0) {
    return (
      <div>
        <h1>ユーザーが見つかりません</h1>
      </div>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: '80vh', width: '80vw', margin: 'auto', padding: '20px'}}
    >
      <UserProfileList userList={users} />
    </Box>
  );
}

// <Link href={'/friend/' + user.userName}>フレンド追加ページ</Link>

'use client';

import FriendList from '@/components/dashboard/friendList';
import UserProfile from '@/components/dashboard/userProfile';
import MatchResult from '@/components/dashboard/matchResult';
import { Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';

/**
 * ダッシュボード画面
 */
export default function Page() {
  // スタイルテーマ
  const theme = useTheme();
  // ルーティング
  const router = useRouter();

  return (
    <>
      <Box
        sx={{
          marginTop: 12,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          px: 4,
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: theme.palette.background.paper,
            borderTop: '5px solid #00babc',
            boxShadow: 4,
            borderRadius: 4,
            minHeight: 450,
            minWidth: 400,
          }}
        >
          {/* ユーザープロフィール */}
          <UserProfile />
          {/* ボタン */}
          <Box
            sx={{
              py: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                router.push('/users/index');
              }}
            >
              Profile
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                router.push('/chat');
              }}
            >
              Chat
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                router.push('/game/index');
              }}
            >
              Start Game
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: theme.palette.background.paper,
            borderTop: '5px solid #00babc',
            boxShadow: 4,
            borderRadius: 4,
            minHeight: 450,
            minWidth: 400,
          }}
        >
          {/* フレンドリスト */}
          <FriendList />
        </Box>
      </Box>
    </>
  );
}

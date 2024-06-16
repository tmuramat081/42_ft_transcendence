'use client';

import FriendList from '@/components/dashboard/friendList';
import UserProfile from '@/components/dashboard/userProfile';
import MatchResult from '@/components/dashboard/matchResult';
import { Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/useAuth';
import { useEffect, useState } from 'react';
import { useAsyncEffect } from '@/hooks/effect/useAsyncEffect';
import { User } from '@/types/user';

/**
 * ダッシュボード画面
 */
export default function Page() {
  const { loginUser, getCurrentUser } = useAuth();
  // スタイルテーマ
  const theme = useTheme();
  // ルーティング
  const router = useRouter();

  useAsyncEffect(async () => {
    await getCurrentUser();
  }, []);

  if (loginUser === null) return;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 'auto',
        gap: 10,
      }}
    >
      <Box
        sx={{
          flex: 1,
          marginTop: 12,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 1024,
          height: '100%',
          minHeight: 400,
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderTop: '5px solid #00babc',
            bgcolor: theme.palette.background.paper,
            boxShadow: 4,
            borderRadius: 4,
          }}
        >
          {/* ユーザープロフィール */}
          <UserProfile />
          {/* ボタン */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: '100%',
              py: 2,
              px: 4,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                router.push(`/users/${loginUser?.userName}`);
              }}
            >
              Profile
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                router.push('/users/index');
              }}
            >
              User List
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
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderTop: '5px solid #00babc',
            bgcolor: theme.palette.background.paper,
            boxShadow: 4,
            borderRadius: 4,
            px: 4,
          }}
        >
          {/* マッチ結果 */}
          <MatchResult user={loginUser} />
        </Box>
        {/* フレンドリスト */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderTop: '5px solid #00babc',
            bgcolor: theme.palette.background.paper,
            boxShadow: 4,
            borderRadius: 4,
            px: 4,
          }}
        >
          <FriendList user={loginUser} />
        </Box>
      </Box>
    </Box>
  );
}

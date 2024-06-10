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
        height: '100%'
      }}
    >
      <Box
        sx={{
          marginTop: 12,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: '5px solid #00babc',
          bgcolor: theme.palette.background.paper,
          width: '100%',
          maxWidth: 800,
          height: '100%',
          minHeight: 400,
          px: 4,
          gap: 2,
          boxShadow: 4,
          borderRadius: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
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
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* フレンドリスト */}
          <FriendList 
            user={loginUser}
          />
          {/* マッチ結果 */}
          <MatchResult 
            user={loginUser}
          />
        </Box>
      </Box>
    </Box>
  );
}

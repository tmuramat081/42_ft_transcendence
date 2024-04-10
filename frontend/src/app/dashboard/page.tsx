'use client';

import FriendList from '@/components/dashboard/friendList';
import { APP_ROUTING } from '@/constants/routing.constant';
import { useAuth } from '@/providers/useAuth';
import { Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * ダッシュボード画面
 */
export default function Page() {
  const router = useRouter();
  const { loginUser, loading } = useAuth();

  // 初期化処理
  useEffect(() => {
    if (loading) return;
    if (!loginUser) {
      router.push(APP_ROUTING.AUTH.SIGN_IN.path);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginUser, loading]);

  return (
    <>
      <Grid
        container
        spacing={2}
      >
        <Grid
          item
          xs={12}
        >
          <FriendList />
        </Grid>
      </Grid>
    </>
  );
}

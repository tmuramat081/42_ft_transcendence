'use client';

import FriendList from '@/components/dashboard/friendList';
import { Grid } from '@mui/material';

/**
 * ダッシュボード画面
 */
export default function Page() {
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

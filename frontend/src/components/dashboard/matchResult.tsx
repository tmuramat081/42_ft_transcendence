'use client';

import { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { GameRecordWithUserName } from '@/types/game/game';
import { useAuth } from '@/providers/useAuth';
import { useAsyncEffect } from '@/hooks/effect/useAsyncEffect';
import { History } from '@/components/game/index/History';
import { User } from '@/types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type Props = {
  user: User
};

export default function MatchResult({ user }: Props) {
  const [records, setRecords] = useState<GameRecordWithUserName[] | undefined>(undefined);

  useEffect(() => {
    if (user === null) return;
    fetch(`${API_URL}/game-room/records/${user.userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setRecords(data.records);
        return data;
      })
      .catch((error) => {
        console.error(error);
      });
  }, [user]);

  return (
    <>
      {/* <Grid container sx={{ mt: 2 }}> */}
        <Typography variant="h4">Match Results</Typography>
        {/* <Grid item>
          <Grid
            container
            direction="column"
            alignItems="center"
          > */}
          <History
            user={user}
            records={records}
          />
          {/* </Grid>
        </Grid>
      </Grid> */}
    </>
  );
}

'use client';

import FriendList from '@/components/dashboard/friendList';
import UserProfile from '@/components/dashboard/userProfile';
import MatchResult from '@/components/dashboard/matchResult';
import { Button, Box, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/useAuth';
import { useAsyncEffect } from '@/hooks/effect/useAsyncEffect';

/**
 * ダッシュボード画面
 */
export default function Page() {
  const { loginUser, getCurrentUser } = useAuth();
  const theme = useTheme();
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
        flexDirection: 'column',
        [theme.breakpoints.up('md')]: {
          flexDirection: 'row',
        },
      }}
    >
      <Grid
        container
        spacing={2}
        sx={{
          flex: 1,
          marginTop: 12,
          width: '100%',
          maxWidth: 1024,
          height: '100%',
          minHeight: 400,
        }}
      >
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderTop: '5px solid #00babc',
            bgcolor: theme.palette.background.paper,
            boxShadow: 4,
            borderRadius: 4,
            p: 2,
          }}
        >
          <UserProfile />
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
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderTop: '5px solid #00babc',
            bgcolor: theme.palette.background.paper,
            boxShadow: 4,
            borderRadius: 4,
            p: 2,
          }}
        >
          <MatchResult user={loginUser} />
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderTop: '5px solid #00babc',
            bgcolor: theme.palette.background.paper,
            boxShadow: 4,
            borderRadius: 4,
            p: 2,
          }}
        >
          <FriendList user={loginUser} />
        </Grid>
      </Grid>
    </Box>
  );
}

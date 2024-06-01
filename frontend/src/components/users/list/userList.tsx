'use client';
import { Box, Grid, Typography } from '@mui/material';
import UserProfileCard from './userCard';
import { FindUsersResponse } from '@/types/user/findUsers';

type Props = {
  userList: FindUsersResponse[];
};

export default function UserProfileList({ userList }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        m: 1,
        p: 2,
        borderTop: '5px solid #00babc',
        boxShadow: 4,
        borderRadius: 2,
      }}
    >
      <Typography
        component="h1"
        variant="h5"
      >
        ユーザー一覧
      </Typography>
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="flex-start"
        sx={{ pt: 2 }}
      >
        {userList.map((user: FindUsersResponse) => (
          <Grid
            item
            xs={6}
            key={user.userId}
          >
            <UserProfileCard user={user} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

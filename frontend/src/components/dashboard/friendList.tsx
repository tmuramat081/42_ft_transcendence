import { FriendList as FL } from '../users/FriendList';
import { User } from '@/types/user';
import { Typography, Grid } from '@mui/material';

type Props = {
  user: User;
};

export default function FriendList({ user }: Props) {
  return (
    <>
    {/* <Grid container sx={{ mt: 2 }}> */}
      <Typography variant="h4">Friend List</Typography>
      <FL friends={user.friends} user={user} />
    {/* </Grid> */}
    </>
  );
}

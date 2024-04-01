'use client';
import SignIn from '@/components/auth/signin/signin_mui';
import { Box } from '@mui/material';

/**
 * ログインページ
 */
export default function Page() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="80vh"
    >
      <SignIn />
    </Box>
  );
}

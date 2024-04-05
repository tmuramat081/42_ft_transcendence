'use client';
import SignUp from '@/components/auth/signup/signup_mui';
import { Box } from '@mui/material';

/**
 * 新規登録ページ
 */
export default function Page() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="60vh"
    >
      <SignUp />
    </Box>
  );
}

'use client';
import UpdateUserForm from '@/components/users/update';
import { Box } from '@mui/material';

export default function Page() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <UpdateUserForm />;
    </Box>
  );
}

'use client';

import { Box, Button, Modal } from '@mui/material';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/useAuth';


const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

type SignUpResponse = {
  accessToken: string;
};

type Props = {
  showModal: boolean;
  validationUserId: number;
};

/**
 * 2FA用モーダル
 */
export default function TwoFaModal({ validationUserId, showModal }: Props) {
  const [code, setCode] = useState<string>('');
  const {signin, loginUser, getCurrentUser, loading} = useAuth();

  // useEffect(() => {
  //   getCurrentUser();
  // }, []);

  const handleSubmit2fa = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //const data = new FormData(e.currentTarget);
    // ここに2FAコードを検証するロジックを追加
    console.log('Submitted 2FA code:', code);
    console.log('validationUserId:', validationUserId);

    fetch(`${API_URL}/auth/2fa/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: validationUserId, code: code }),
    })
      .then((res) => {
        //console.log(res.data);
        return res.json();
      })
      .then((data: SignUpResponse) => {
        if (data.accessToken !== undefined) {
          console.log('Success:', data.accessToken);
          //setToken(data.accessToken);
          //router.push('/');
          getCurrentUser();
        } else {
          // errorメッセージを表示
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <Modal
      open={showModal}
      onClose={() => undefined}
      aria-labelledby="child-modal-title"
      aria-describedby="child-modal-description"
    >
      <Box
        component="form"
        onSubmit={handleSubmit2fa}
        noValidate
        sx={{
          position: 'absolute' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70%',
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          pt: 2,
          px: 4,
          pb: 3,
        }}
      >
        <MuiOtpInput
          value={code}
          onChange={setCode}
          length={6}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Submit
        </Button>
      </Box>
    </Modal>
  );
}

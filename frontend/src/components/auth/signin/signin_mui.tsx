import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/useAuth';
import CircularProgress from '@mui/material/CircularProgress';

import { APP_ROUTING } from '@/constants/routing.constant';
import { useTheme } from '@mui/material/styles';
import TwoFaModal from '@/components/auth/signin/modal/twoFaModal';
import { useAsyncEffect } from '@/hooks/effect/useAsyncEffect';

// const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type SignInResponse = {
  status: string;
  userId?: number;
};

export default function SignIn() {
  const theme = useTheme();
  const [validationUserId, setValidationUserId] = useState<number>(0);
  const [show2Fa, setShow2Fa] = useState<boolean>(false);

  const router = useRouter();
  const { loginUser, getCurrentUser, loading } = useAuth();
  // エラー状態
  const [errorFields, setErrorFields] = useState<{ [key: string]: string }>({
    name: '',
    password: '',
  });

  const [ errorMessage, setErrorMessages ] = useState<string>('');

  // validation
  const validate = (data: FormData): boolean => {
    let isValid = true;
    const errors: { [key: string]: string } = {};
    // 必須チェック
    if (!data.get('name')) {
      errors.name = 'Please enter your name';
      isValid = false;
    }
    if (!data.get('password')) {
      errors.password = 'Please enter your password';
      isValid = false;
    }
    setErrorFields(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    // バリデーション
    if (!validate(data)) {
      return;
    }

    // ここでフォームのデータを処理します
    fetch(`${API_URL}/users/signin`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName: data.get('name'), password: data.get('password') }),
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else { 
          throw new Error('Failed to sign in');
        }
      })
      .then((data: SignInResponse) => {
        if (data.status === 'SUCCESS' && data.userId === undefined) {
          // ダッシュボート画面へ遷移
          router.push(APP_ROUTING.DASHBOARD.path);
        } else if (data.status === '2FA_REQUIRED' && data.userId !== undefined) {
          setValidationUserId(data.userId);
          setShow2Fa(true);
        }
        // ログイン失敗
      })
      .catch((error) => {
        // Alertメッセージを表示
        console.error('Error:', error);
        setErrorMessages('Failed to sign in');
      });
  };

  const handleClick42Login = () => {
    router.push(`${API_URL}/auth/callback/42`);
  };

  const _handleOpen = () => {
    setShow2Fa(true);
  };
  const _handleClose = () => {
    setShow2Fa(false);
  };

  // useEffect
  useAsyncEffect(async () => {
    await getCurrentUser();
  }, []);

  // 読み込み中はローディングを表示
  // 一瞬見れる問題を解決
  if (loading || loginUser) {
    // return <p>loading...</p>
    return <CircularProgress color="secondary" />;
  }

  return (
    <>
      {/* アラートの表示
      <Stack sx={{ width: '100%' }} spacing={2}>
        <Alert severity="success">This is a success Alert.</Alert>
        <Alert severity="info">This is an info Alert.</Alert>
        <Alert severity="warning">This is a warning Alert.</Alert>
        <Alert severity="error">This is an error Alert.</Alert>
        <Alert severity="warning" onClose={() => {}}>
          This Alert displays the default close icon.
        </Alert>
      </Stack>
      */}
      <Container
        component="main"
        maxWidth="xs"
      >
        <Box
          sx={{
            marginTop: 4,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: theme.palette.background.paper,
            borderTop: '5px solid #00babc',
            boxShadow: 4,
            borderRadius: 2,
          }}
        >
          {errorMessage && (
            <Alert severity="error">
              {errorMessage}
            </Alert>
          )}
          <Avatar sx={{ m: 1, bgcolor: theme.palette.primary.main }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography
            component="h1"
            variant="h5"
          >
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="User Name"
              name="name"
              autoComplete="name"
              autoFocus
              error={!!errorFields.name}
              helperText={errorFields.name}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              error={!!errorFields.password}
              helperText={errorFields.password}
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                />
              }
              label="Remember me"
            />
            <Box
              sx={{
                display: 'flex',
                gap: 4,
                height: 40,
              }}
            >
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ width: '60%' }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                color="primary"
                sx={{ fontSize: 14 }}
                onClick={handleClick42Login}
              >
                42 login
              </Button>
            </Box>
          </Box>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ mt: 2 }}
          >
            {"Don't have an account?"}
            <Link
              href={APP_ROUTING.AUTH.SIGN_UP.path}
              variant="body2"
              sx={{
                color: theme.palette.text.primary,
                ml: 2,
              }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Container>

      <TwoFaModal
        showModal={show2Fa}
        validationUserId={validationUserId}
      />
    </>
  );
}

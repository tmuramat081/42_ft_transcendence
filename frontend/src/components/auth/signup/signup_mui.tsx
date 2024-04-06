import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';

import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/useAuth';
import { useEffect, useState } from 'react';
import { APP_ROUTING } from '@/constants/routing.constant';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SignUp() {
  // スタイルテーマ
  const theme = useTheme();
  // ルーティング用
  const router = useRouter();
  // 認証情報
  const { loginUser, getCurrentUser, loading } = useAuth();
  // トークン
  const [_token, setToken] = useState<string | null>('');
  // エラー状態
  const [errorFields, setErrorFields] = useState<{[key: string]: string}>({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  // セッション取得
  useEffect(() => {
    getCurrentUser();
  }, []);

  //field修正

  // handleSubmit修正

  // ボタンを押した時の処理
  // const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   const data = new FormData(event.currentTarget);
  //   console.log({
  //     email: data.get('email'),
  //     password: data.get('password'),
  //   });
  // };

  // validation
  const validate = (data: FormData) => {
    let isValid = true;
    const errors: { [key: string]: string } = {};
    // 必須チェック
    if (!data.get('name')) {
      errors.name = 'Please enter your name';
      isValid = false;
    }
    if (!data.get('email')) {
      errors.email = 'Please enter your email';
      isValid = false;
    }
    if (!data.get('password')) {
      errors.password = 'Please enter your password';
      isValid = false;
    }
    if (!data.get('passwordConfirm')) {
      errors.passwordConfirm = 'Please enter your password confirmation';
      isValid = false;
    }
    // 桁数チェック
    if (data.get('password')) {
      const password = data.get('password')?.toString();
      if (password && password.length > 20 ) {
        errors.password = 'Please enter at least 8 characters';
        isValid = false;
      }
    }
    // 相関チェック
    if (data.get('password') !== data.get('passwordConfirm')) {
      errors.passwordConfirm = 'Passwords do not match';
      isValid = false;
    }
    setErrorFields(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    console.log(
      'Submitted data:',
      data.get('name'),
      data.get('email'),
      data.get('password'),
      data.get('passwordConfirm'),
    );

    // バリデーション
    if (!validate(data)) {
      return;
    }

    // // ここでフォームのデータを処理します
    // // axios.post('localhost:3001/users/login', { username, email });
    fetch(`${API_URL}/users/signup`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      //body: JSON.stringify({ userName, email, password, passwordConfirm }),
      body: JSON.stringify({
        userName: data.get('name'),
        email: data.get('email'),
        password: data.get('password'),
        passwordConfirm: data.get('passwordConfirm'),
      }),
    })
      .then((res) => {
        // /console.log(res.json());
        return res.json();
      })
      //.then((res) => res.json())
      .then((data) => {
        console.log('Success:', data.accessToken);
        setToken(data.accessToken);
        router.push(APP_ROUTING.DASHBOARD.path);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    console.log('送信されたデータ:', {
      name: data.get('name'),
      email: data.get('email'),
      password: data.get('password'),
      passwordConfirm: data.get('passwordConfirm'),
    });

    // console.log('送信されたデータ:', { userName, password });
    // // 送信後の処理（例: フォームをクリアする）
    // setUserName('');
    // setEmail('');
    // setPassword('');
    // setPasswordConfirm('');
  };

  // ローディングアニメーション
  if (loading || loginUser) {
    return <CircularProgress />;
  }

  return (
    <>
      <Container
        component="main"
        maxWidth="xs"
      >
        <Box
          sx={{
            marginTop: 24,
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
          <Avatar sx={{ m: 1, bgcolor: theme.palette.primary.main }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography
            component="h1"
            variant="h5"
          >
            Sign up
          </Typography>

          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
          >
            <Grid
              container
              spacing={1}
            >
              <Grid
                item
                xs={12}
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
              </Grid>
              <Grid
                item
                xs={12}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  error={!!errorFields.email}
                  helperText={errorFields.email}
                />
              </Grid>
              <Grid
                item
                xs={12}
              >
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
              </Grid>
              <Grid
                item
                xs={12}
              >
                <TextField
                  required
                  fullWidth
                  name="passwordConfirm"
                  label="PasswordConfirm"
                  type="password"
                  id="passwordConfirm"
                  autoComplete="new-password"
                  error={!!errorFields.passwordConfirm}
                  helperText={errorFields.passwordConfirm}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 1, mb: 1 }}
            >
              Sign Up
            </Button>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 4,
              alignItems: 'center',
            }}
          >
          </Box>
          <Typography
            variant="body2"
            color="textSecondary"
          >
            Already have an account?
            <Button
              onClick={() => router.push('/auth/signin')}
            >
              Login here.
            </Button>
          </Typography>
        </Box>
      </Container>
    </>
  );
}

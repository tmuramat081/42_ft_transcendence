/* eslint-disable */
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme } from '@mui/material/styles';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/useAuth';
//import Modal from '../../components/users/2fa/modal'; // Modalコンポーネントをインポート
import CircularProgress from '@mui/material/CircularProgress';
import { MuiOtpInput } from 'mui-one-time-password-input';
import Modal from '@mui/material/Modal';

import { APP_ROUTING } from '@/constants/routing.constant';
import { useTheme } from '@mui/material/styles';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SignIn() {
  const theme = useTheme();

  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [validationUserId, setValidationUserId] = useState<number>(0);
  const [show2Fa, setShow2Fa] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');

  const router = useRouter();
  const { signin, loginUser, getCurrentUser, loading } = useAuth();

  // useEffect
  useEffect(() => {
    getCurrentUser();
  }, []);

  //field修正

  // handleSubmit修正

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    console.log('Submitted data:', data.get('name'), data.get('password'));

    // ここでフォームのデータを処理します
    fetch(`${API_URL}/users/signin`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      //body: JSON.stringify({ userName, password }),
      body: JSON.stringify({ userName: data.get('name'), password: data.get('password') }),
    })
      .then((res) => {
        // /console.log(res.json());
        return res.json();
      })
      //.then((res) => res.json())
      .then((data) => {
        if (data.status === 'SUCCESS' && data.userId === undefined) {
          //console.log('Success:', data.accessToken);
          getCurrentUser();
          // ダッシュボート画面へ遷移
          router.push(APP_ROUTING.DASHBOARD.path);
        } else if (data.status === '2FA_REQUIRED' && data.userId !== undefined) {
          setValidationUserId(data.userId);
          setShow2Fa(true);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    //console.log('送信されたデータ:', { userName, password });
    console.log('送信されたデータ:', { name: data.get('name'), password: data.get('password') });

    //signin( userName, password );
    //getCurrentUser();
    // 送信後の処理（例: フォームをクリアする）
    // setUserName('');
    // setPassword('');
  };

  //React.FormEvent<HTMLFormElement>
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
      .then((data) => {
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

        // redirect
      });
  };

  const handleOpen = () => {
    setShow2Fa(true);
  };
  const handleClose = () => {
    setShow2Fa(false);
  };

  //   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  //     event.preventDefault();
  //     const data = new FormData(event.currentTarget);
  //     console.log({
  //       email: data.get('email'),
  //       password: data.get('password'),
  //     });
  //   };

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
            sx={{ mt: 1 }}
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{
                my: 1,
              }}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid
                item
                xs
              >
                <Link
                  href="#"
                  variant="body2"
                  sx={{ color: theme.palette.text.primary }}
                >
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link
                  href="#"
                  variant="body2"
                  sx={{ color: theme.palette.text.primary }}
                >
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>

          {/* 2FA用モーダル */}
          <Modal
            open={show2Fa}
            onClose={() => {}}
            aria-labelledby="child-modal-title"
            aria-describedby="child-modal-description"
          >
            <Box
              component="form"
              onSubmit={handleSubmit2fa}
              noValidate
              sx={{
                position: 'absolute' as 'absolute',
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
              <h2 id="child-modal-title">Text in a child modal</h2>
              <p id="child-modal-description">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              </p>
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

          <Box
            sx={{
              display: 'flex',
              gap: 4,
              alignItems: 'center',
            }}
          >
            <Button
              onClick={() => {
                router.push('/auth/signup');
              }}
              variant="contained"
              color="primary"
            >
              SignUp
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                router.push(`${API_URL}/auth/callback/42`);
              }}
            >
              42ログイン
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}

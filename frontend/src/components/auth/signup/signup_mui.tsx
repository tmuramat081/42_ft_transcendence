/* eslint-disable */
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';

import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/useAuth';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SignUp() {
  const theme = useTheme();

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [user, setUser] = useState({});

  const [token, setToken] = useState('');

  const router = useRouter();
  const { signin, loginUser, getCurrentUser, loading } = useAuth();

  useEffect(() => {
    //if (token == '' || token === undefined) return;
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
        getCurrentUser();
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
            sx={{ mt: 1 }}
          >
            <Grid
              container
              spacing={1}
            >
              <Grid
                item
                xs={12}
                sm={6}
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
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
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
                  type="passwordConfirm"
                  id="passwordConfirm"
                  autoComplete="new-password"
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
            <Grid
              container
              justifyContent="flex-end"
            >
              <Grid item>
                <Link
                  href="#"
                  variant="body2"
                >
                  <Typography sx={{ fontSize: 12 }}>Already have an account? Sign in</Typography>
                </Link>
              </Grid>
            </Grid>
          </Box>

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

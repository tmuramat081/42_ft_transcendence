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
import { createTheme, ThemeProvider } from '@mui/material/styles';

import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/useAuth';
import { useState, useEffect } from 'react';

function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function SignUp() {

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [user, setUser] = useState({});

  const [token, setToken] = useState('');

  const router = useRouter();
  const {signin, loginUser, getCurrentUser, loading} = useAuth();

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

    console.log('Submitted data:', data.get('name'), data.get('email'), data.get('password'), data.get('passwordConfirm'))

    // // ここでフォームのデータを処理します
    // // axios.post('localhost:3001/users/login', { username, email });
    fetch('http://localhost:3001/users/signup', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        //body: JSON.stringify({ userName, email, password, passwordConfirm }),
        body: JSON.stringify({userName: data.get('name'), email: data.get('email'), password: data.get('password'), passwordConfirm: data.get('passwordConfirm')}),
    })
    .then ((res) => {
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

    console.log('送信されたデータ:', { name: data.get('name'), email: data.get('email'), password: data.get('password'), passwordConfirm: data.get('passwordConfirm') });

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
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12}>
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
              <Grid item xs={12}>
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
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox value="allowExtraEmails" color="primary" />}
                  label="I want to receive inspiration, marketing promotions and updates via email."
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="#" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>

          <Button onClick={ () => { router.push('/auth/signup') } } variant="contained" color="primary">SignUp</Button>

          <Button variant="contained" color="primary" onClick={() => { router.push('http://localhost:3001/auth/callback/42')}}>42ログイン</Button>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}
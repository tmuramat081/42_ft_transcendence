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

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/useAuth';
//import Modal from '../../components/users/2fa/modal'; // Modalコンポーネントをインポート
import CircularProgress from '@mui/material/CircularProgress';
import { MuiOtpInput } from 'mui-one-time-password-input'
import Modal from '@mui/material/Modal';

const style = {
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
  };

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

export default function SignIn() {

    const [userName, setUserName] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const [validationUserId, setValidationUserId] = useState<number>(0);
    const [show2Fa, setShow2Fa] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const router = useRouter();
    const {signin, loginUser, getCurrentUser, loading} = useAuth();

    // useEffect
    useEffect(() => {
        getCurrentUser();
    }, []);

    //field修正

    // handleSubmit修正

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);

        console.log('Submitted data:', data.get('name'), data.get('password'))
        
        // ここでフォームのデータを処理します
        fetch('http://localhost:3001/users/signin', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            //body: JSON.stringify({ userName, password }),
            body: JSON.stringify({ userName: data.get('name'), password: data.get('password') }),
        })
        .then ((res) => {
            // /console.log(res.json());
            return res.json();
        })
        //.then((res) => res.json())
        .then((data) => {
            if (data.status === "SUCCESS" && data.userId === undefined) {
                //console.log('Success:', data.accessToken);
                getCurrentUser();
                router.push('/');
            } else if (data.status === "2FA_REQUIRED" && data.userId !== undefined) {
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

    const handleSubmit2fa = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        // ここに2FAコードを検証するロジックを追加
        console.log('Submitted 2FA code:', code);
        console.log('validationUserId:', validationUserId);
  
        fetch('http://localhost:3001/auth/2fa/verify', {
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
        return <CircularProgress color="secondary" />
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
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>

      <Modal
        open={show2Fa}
        onClose={ () => {}}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >


        <Box sx={{ ...style }}>
                <h2 id="child-modal-title">Text in a child modal</h2>
                <p id="child-modal-description">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                </p>
                <MuiOtpInput
                    value={code}
                    onChange={setCode}
                    length={6}
                />
                <Button onClick={handleSubmit2fa}>Submit</Button>
        </Box>
      </Modal>


          <Button onClick={ () => { router.push('/auth/signup') } } variant="contained" color="primary">SignUp</Button>

          <Button variant="contained" color="primary" onClick={() => { router.push('http://localhost:3001/auth/callback/42')}}>42ログイン</Button>

        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}
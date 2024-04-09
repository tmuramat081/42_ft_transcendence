'use client';
import { APP_ROUTING } from '@/constants/routing.constant';
import { useWebSocket } from '@/providers/webSocketProvider';
import { AppBar, Avatar, Box, Link, Toolbar } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '@/providers/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

const GlobalHeader = () => {
  const { socket } = useWebSocket();
  const { loginUser } = useAuth();

  // セッション情報

  const handleSignOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // ログアウト処理
    fetch(`${API_URL}/users/signout`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(() => {
        // ソケットを切断
        socket?.disconnect();
        // ログイン画面に遷移
        window.location.href = APP_ROUTING.AUTH.SIGN_IN.path;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: 'primary',
          top: 0,
          width: '100%',
        }}
      >
        <Toolbar>
          {/* サイトロゴ */}
          <Link
            href={APP_ROUTING.DASHBOARD.path}
            color="secondary"
            variant="h6"
          >
            Ping-Pong!
          </Link>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* ユーザーアイコン */}
            {loginUser && (
              <Link
                href={APP_ROUTING.USER.UPDATE.path}
                color="inherit"
              >
                <Avatar
                  alt={loginUser.userName}
                  src={`${API_URL}/api/uploads/${loginUser.icon}`}
                  sx={{ width: 32, height: 32 }}
                >
                  {loginUser.icon}
                </Avatar>
              </Link>
            )}
            {/* ログアウトボタン */}
            <Link
              color="secondary"
              variant="h6"
              onClick={handleSignOut}
              component="button"
            >
              <LogoutIcon />
            </Link>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default GlobalHeader;

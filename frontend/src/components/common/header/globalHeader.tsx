'use client';
import { APP_ROUTING } from '@/constants/routing.constant';
import { SOCKET_EVENTS } from '@/constants/socket.constant';
import { useWebSocket } from '@/providers/webSocketProvider';
import { AppBar, Box, Link, Toolbar } from '@mui/material';
import { useEffect, useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

const GlobalHeader = () => {
  const { socket } = useWebSocket();
  const [_isConnected, setIsConnected] = useState(false);

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

  useEffect(() => {
    if (!socket) return;

    socket.on(SOCKET_EVENTS.COMMON.CONNECT, () => {
      setIsConnected(true);
    });

    socket.on(SOCKET_EVENTS.COMMON.DISCONNECT, () => {
      setIsConnected(false);
    });

    return () => {
      socket.off(SOCKET_EVENTS.COMMON.CONNECT);
      socket.off(SOCKET_EVENTS.COMMON.DISCONNECT);
    };
  });

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
          {/* ログアウトボタン */}
          <Box sx={{ ml: 'auto' }}>
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

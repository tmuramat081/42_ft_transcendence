'use client';
import { SOCKET_EVENTS } from '@/constants/socket.constant';
import { useWebSocket } from '@/providers/webSocketProvider';
import { AppBar, Box, Link, Toolbar } from '@mui/material';
import { useEffect, useState } from 'react';

const GlobalHeader = () => {
  const { socket } = useWebSocket();
  const [isConnected, setIsConnected] = useState(false);

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
        position="fixed"
        sx={{
          backgroundColor: 'primary',
          top: 0,
          width: '100%',
        }}
      >
        <Toolbar>
          <Link
            href="/"
            color="secondary"
            variant="h6"
          >
            Ping-Pong!
          </Link>
          {isConnected && <span style={{ marginLeft: 'auto' }}>connected</span>}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default GlobalHeader;

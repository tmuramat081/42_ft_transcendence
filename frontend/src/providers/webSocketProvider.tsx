'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type SocketContextType = {
  socket: Socket | null;
};

const initialSocketContext = {
  socket: null,
};

const SocketContext = createContext<SocketContextType>(initialSocketContext);
export const useWebSocket = () => useContext(SocketContext);

type Props = {
  children: React.ReactNode;
};

export const WebSocketProvider = ({ children }: Props) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    const socket = io(API_URL ?? '');
    setSocket(socket);

    socket.on('connect', () => {
      console.log('socket connected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

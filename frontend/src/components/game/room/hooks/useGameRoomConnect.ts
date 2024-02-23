'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const WEBSOCKET_URL = 'http://localhost:3001';

type Props = {
  roomId: number;
  userId: number;
};

export const UseGameConnection = ({ roomId, userId }: Props) => {
  // ゲーム開始フラグ
  const [gameStarted, setGameStarted] = useState(false);
  // 接続ログ
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (log: string) => {
    console.log(log);
    setLogs((prev) => {
      return [...prev, log];
    });
  };

  useEffect(() => {
    const socket = io(WEBSOCKET_URL);

    // ゲーム開始
    socket.on('startGame', (msg: string) => {
      addLog(`start game: ${msg}`);
      setGameStarted(true);
    });

    // サーバーからACKを受け取り、ルームに参加
    socket.on('message', (msg: string) => {
      addLog(`${msg}`);
      socket.emit('join', { roomId: roomId, userId: userId });
    });

    // サーバー接続成功
    socket.on('connect', () => {
      addLog(`connection ID: ${socket.id}`);
    });

    // clean-up
    return () => {
      socket.disconnect();
      addLog('disconnect');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    gameStarted,
    logs,
  };
};

export default UseGameConnection;

'use client';
import { SOCKET_EVENTS } from '@/constants/socket.constant';
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

type Props = {
  roomId: number;
  userId: number;
  socket: Socket | null;
};

type UseGameConnectionReturnType = {
  gameStarted: boolean; // ゲーム開始フラグ
  users: string[]; // 接続ユーザー名
  logs: string[]; // 接続ログ
};

export const UseGameConnection = ({
  roomId,
  userId,
  socket,
}: Props): UseGameConnectionReturnType => {
  // ゲーム開始フラグ
  const [gameStarted, setGameStarted] = useState(false);
  // 接続ユーザー名
  const [users, setUsers] = useState<string[]>([]);
  // 接続ログ
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (log: string) => {
    console.log(log);
    setLogs((prev) => {
      return [...prev, log];
    });
  };

  useEffect(() => {
    if (!socket) return;

    // サーバー接続・ルーム入室
    socket.on(SOCKET_EVENTS.COMMON.CONNECT, () => {
      addLog(`connection ID: ${socket.id}`);
      socket.emit(SOCKET_EVENTS.GAME.JOIN_ROOM, { roomId: roomId, userId: userId });
    });

    // ゲーム開始
    socket.on(SOCKET_EVENTS.GAME.START_GAME, (msg: string) => {
      addLog(`start game: ${msg}`);
      setGameStarted(true);
    });

    // 入室者情報取得
    socket.on(SOCKET_EVENTS.GAME.USERS_IN_ROOM, (userIds: string[]) => {
      console.log('Users in room', userIds);
      setUsers(userIds);
    });

    // clean-up
    return () => {
      socket.disconnect();
      addLog('disconnect');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userId]);

  return {
    gameStarted,
    users,
    logs,
  };
};

export default UseGameConnection;

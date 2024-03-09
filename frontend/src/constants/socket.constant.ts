// web socketのイベント名
export const SOCKET_EVENTS = {
  COMMON: {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    MESSAGE: 'message',
  },
  GAME: {
    JOIN_ROOM: 'joinGameRoom',
    START_GAME: 'startGame',
    USERS_IN_ROOM: 'usersInRoom',
  },
} as const;

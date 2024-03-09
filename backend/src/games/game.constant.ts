export const GAME_ROOM_STATUS = {
  WAITING: 'waiting',
  STARTED: 'started',
  FINISHED: 'finished',
} as const;

export const SOCKET_EVENTS_GAME = {
  JOIN_ROOM: 'joinGameRoom',
  START_GAME: 'startGame',
  END_GAME: 'endGame',
  USERS_IN_ROOM: 'usersInRoom',
  UPDATE_USERS: 'update',
} as const;

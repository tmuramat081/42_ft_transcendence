export const APP_ROUTING = {
  TOP: {
    path: '/',
    name: 'トップ',
  },
  GAME: {
    path: '/game',
    name: 'ゲーム',
    ROOMS: {
      LIST: {
        path: '/game/rooms',
        name: 'ルーム一覧',
      },
      DETAIL: {
        path: '/game/rooms/:id',
        name: 'ゲームルーム',
      },
    },
  },
};

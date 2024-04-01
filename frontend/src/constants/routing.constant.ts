export const APP_ROUTING = {
  TOP: {
    path: '/',
    name: 'トップ',
  },
  DASHBOARD: {
    path: '/dashboard',
    name: 'ダッシュボード',
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

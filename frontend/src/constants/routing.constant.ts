export const APP_ROUTING = {
  TOP: {
    path: '/',
    name: 'トップ',
  },
  AUTH: {
    SIGN_UP: {
      path: '/auth/signup',
      name: 'サインアップ',
    },
    SIGN_IN: {
      path: '/auth/signin',
      name: 'サインイン',
    },
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

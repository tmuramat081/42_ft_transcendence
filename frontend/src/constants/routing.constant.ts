export const APP_ROUTING = {
  TOP: {
    path: '/',
    name: 'トップ',
    public: true,
  },
  AUTH: {
    SIGN_UP: {
      path: '/auth/signup',
      name: 'サインアップ',
      public: true,
    },
    SIGN_IN: {
      path: '/auth/signin',
      name: 'サインイン',
      public: true,
    },
  },
  USER: {
    UPDATE: {
      path: '/users/update',
      name: 'ユーザー情報更新',
      public: false,
    },
  },
  DASHBOARD: {
    path: '/dashboard',
    name: 'ダッシュボード',
    public: false,
  },
  GAME: {
    path: '/game',
    name: 'ゲーム',
    ROOMS: {
      LIST: {
        path: '/game/rooms',
        name: 'ルーム一覧',
        public: false,
      },
      DETAIL: {
        path: '/game/rooms/:id',
        name: 'ゲームルーム',
        public: false,
      },
    },
  },
};

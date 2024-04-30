export const DiffucultyLevel = {
    EASY: 'Easy',
    NORMAL: 'Normal',
    HARD: 'Hard',
} as const;

// keyのunion型にする
export type DiffucultyLevel = (typeof DiffucultyLevel)[keyof typeof DiffucultyLevel];

export const UserStatus = {
    ONLINE: 'OMLINE',
    OFFLINE: 'OFFLINE',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export type GameSetting = {
    difficulty: DiffucultyLevel;
    matchPoint: number;
    player1Score: number;
    player2Score: number;
};

export type GameRecordWithUserName = {
    id: number;
    winnerScore: number;
    loserScore: number;
    createdAt: Date;
    loserName: string;
    winnerName: string;
};

export type FinishedGameInfo = {
    winnerName: string;
    loserName: string;
    winnerAliasName: string;
    loserAliasName: string;
    winnerScore: number;
    loserScore: number;
    round: number;
};

export type Invitation = {
    hostId: number;
    guestId: number;
};

export type Ball = {
    x: number;
    y: number;
    radius: number;
};

//height2は相手のバーの高さ
export type GameInfo = {
    height1: number;
    height2: number;
    ball: Ball;
};

export type GameParameters = {
    topLeftX: number;
    canvasWidth: number;
    canvasHeight: number;
    barWidth: number;
    barLength: number;
    player1X: number;
    player2X: number;
    highestPos: number;
    lowestPos: number;
    sideBarLeft: number;
    sideBarRight: number;
    lineDashStyle: number[];
    initialHeight: number;
    ballInitialX: number;
    ballInitialY: number;
    ballRadius: number;
    // フロントとバックエンドの画面比率
    widthRatio: number;
};

export type SocketAuth = {
    userId: number;
};

export type WatchInfo = {
    roomName: string;
    player1: PlayerInfo;
    player2: PlayerInfo;
};

export const GameState = {
    SETTING: 'SETTING',
    PLAYING: 'PLAYING',
} as const;

export type GameState = (typeof GameState)[keyof typeof GameState];

export type PlayerInfo = {
    name: string;
    aliasName: string;
    round: number;
};
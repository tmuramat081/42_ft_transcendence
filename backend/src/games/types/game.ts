import { Socket, RemoteSocket } from 'socket.io';
// DefaultEventMap: Socket.IOのデフォルトイベントマップとは、Socket.IOのイベント名とそのペイロードの型をマッピングする型
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

// 型定義

// enumでも良い
// オブジェクト定義
// as const: TypeScriptのconstアサーションを使用して、文字列リテラル型を作成
// as consrがない場合、GameStateは文字列リテラル型ではなく、文字列型として推論される
// 文字リテラルと文字列型の違いは、文字列リテラル型は文字列のリテラルのみを受け入れる型で、文字列型は文字列リテラルと文字列を受け入れる型
//as constはTypeScriptのconstアサーションであり、オブジェクトや配列の各要素をリテラル型として扱うようTypeScriptに指示します。これがなければ、GameStateの値は広いstring型として推論されますが、as constによってそれぞれのプロパティの値がリテラル型（この場合は'SETTING'と'PLAYING'）として扱われ、これらの値以外を受け入れないようになります。
export const GameState = {
    SETTING: 'SETTING',
    PLAYING: 'PLAYING',
} as const;

// 値から型を生成
// 値と型の一貫性を保つことに焦点を当て、特に値が複数の場所で再利用される場合に便利
// GameStateの型をGameStateのキーの値にする
//この行ではGameState型を定義しています。ここでのtypeof GameStateは上で定義したGameState定数の型を取得します。この型は、リテラル型'SETTING'と'PLAYING'のユニオンです。
//keyof typeof GameStateはGameStateオブジェクトの全キー（この場合はSETTINGとPLAYING）のユニオン型を生成します。そして、(typeof GameState)[keyof typeof GameState]はこれらのキーに対応する値の型、つまり'SETTING' | 'PLAYING'のユニオン型を生成します。
//最終的に、この型定義によりGameState型は'SETTING'または'PLAYING'のいずれかの値しか取れないようになります。これにより、コード内でゲームの状態を扱う際の型安全性が向上します。
export type GameState = (typeof GameState)[keyof typeof GameState];


//型から始めるアプローチは、型の意図を明確にし、先に型システムを定義することで全体の設計をガイドする
// // ゲームの状態を表す型を先に定義
// type GameStateType = 'SETTING' | 'PLAYING';

// // 型に基づいたオブジェクト定義
// const GameState: Record<GameStateType, GameStateType> = {
//     SETTING: 'SETTING',
//     PLAYING: 'PLAYING',
// };


// 難易度
export const DiffucultyLevel = {
    EASY: 'EASY',
    NORMAL: 'NORMAL',
    HARD: 'HARD',
} as const;

export type DiffucultyLevel = (typeof DiffucultyLevel)[keyof typeof DiffucultyLevel];

// ユーザーの状態
export const UserStatus = {
    ONLINE: 'ONLINE',
    PLAYING: 'PLAYING',
    OFFLINE: 'OFFLINE',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export type Player = {
    name: string;
    id: number;
    point: number;
    socket: Socket | RemoteSocket<DefaultEventsMap, DefaultEventsMap>;
    height: number;
    score: number;
};

export type Ball = {
    x: number;
    y: number;
    radius: number;
};

// Ballにまとめたい
// 方向
export type BallVec = {
    xVec: number;
    yVec: number;
    speed: number;
};

// ゲームの設定
export type GameSetting = {
    difficulty: DiffucultyLevel;
    matchPoint: number;
    player1Score: number;
    player2Score: number;
};

// 部屋の情報
export type RoomInfo = {
    roomName: string;
    player1: Player;
    player2: Player;
    supporters: Socket[];
    ball: Ball;
    ballVec: BallVec;
    // ?
    isPlayer1Turn: boolean;
    gameSetting: GameSetting;
    // バーの長さ設定
    barLength: number;
    // バーの速度設定
    barSpeed: number;
    initialHeight: number;
    lowestPosition: number;
    rewards: number;
    gameState: GameState;
};

// まとめられない？
// ゲームの状態
export type GameInfo = {
    height1: number;
    height2: number;
    ball: Ball;
};

export type FinishedGameInfo = {
    winnerName: string;
    loserName: string;
    winnerScore: number;
    loserScore: number;
};

export type Friend = {
    id: number;
    name: string;
};

export type Invitation = {
    guestId: number;
    hostId: number;
    hostSocketId: string;
};

export type SocketAuth = {
    userId: number;
};

export type FriendGameInfo = {
    player1Name: string;
    player2Name: string;
    gameState: GameState;
    gameSetting: GameSetting;
};
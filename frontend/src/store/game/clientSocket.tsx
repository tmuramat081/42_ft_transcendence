import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';

// state管理
// あとでuseConrtextに変更する

// zustand: 状態管理ライブラリで、ReactのコンテキストAPIやReduxのような他の状態管理ライブラリの代わりに使用されることがあります。
//非常にシンプルでフックベースのAPIを提供しており、グローバルステートを簡単に作成・使用できます。 useContextより簡単に使える

// const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type State = {
    socket: Socket;
}

// create: socketの初期化
export const useSocketStore = create<State>(() => ({
    //, {autoConnect: false}   soxket.connect()を使う場合は、ここに記述
    // socket: io("http://localhost:3001/game", {autoConnect: false} ),
    socket: io(API_URL + "/game", {autoConnect: false} ),
}));

// ステップ1: Contextの作成
// まず、Socketの状態をグローバルに共有するためのContextを作成します。

// jsx
// Copy code
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { io, Socket } from 'socket.io-client';

// // ソケットの状態を持つContextの作成
// const SocketContext = createContext<Socket | null>(null);
// ステップ2: Providerコンポーネントの作成
// 次に、このContextを提供するためのProviderコンポーネントを作成します。このコンポーネントは、ソケットの接続を管理し、それを子コンポーネントに提供します。

// jsx
// Copy code
// export const SocketProvider: React.FC = ({ children }) => {
//   // ソケットの状態をuseStateで管理
//   const [socket, setSocket] = useState<Socket>(() => io('ws://localhost:3001/game', { autoConnect: false }));

//   // ソケットを必要に応じて接続・切断するためのエフェクト
//   useEffect(() => {
//     socket.connect();

//     return () => {
//       socket.disconnect();
//     };
//   }, [socket]);

//   // コンテキストプロバイダーを通じてソケットを提供
//   return (
//     <SocketContext.Provider value={socket}>
//       {children}
//     </SocketContext.Provider>
//   );
// };
// ステップ3: useContextを使用してソケットにアクセス
// 最後に、任意のコンポーネント内でuseContextフックを使ってソケットの状態にアクセスできます。

// jsx
// Copy code
// const MyComponent = () => {
//   const socket = useContext(SocketContext);

//   // ソケットを使用した処理...
//   useEffect(() => {
//     if (socket) {
//       socket.on('someEvent', (data) => {
//         console.log(data);
//       });
//     }

//     return () => {
//       if (socket) {
//         socket.off('someEvent');
//       }
//     };
//   }, [socket]);

//   return <div>My Component</div>;
// };
// このアプローチを使用する場合、<SocketProvider>コンポーネントでアプリケーション（またはソケットを使用したいコンポーネントの一部）をラップする必要があります。これにより、その子コンポーネントはどこからでもソケットの状態にアクセスできるようになります。

// jsx
// Copy code
// // App.js または類似のエントリポイント
// const App = () => (
//   <SocketProvider>
//     <MyComponent />
//     {/* 他のコンポーネント... */}
//   </SocketProvider>
// );
// この方法で、zustandを使った例と同様に、ソケットの状態をアプリケーション全体で利用し、リアルタイム通信を行うことができます。







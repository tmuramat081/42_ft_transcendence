import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';

// state管理
// あとでuseConrtextに変更する

type State = {
    socket: Socket;
}

// create: socketの初期化
export const useSocketStore = create<State>(() => ({
    //, {autoConnect: false}   soxket.connect()を使う場合は、ここに記述
    socket: io("http://localhost:3001/game", {autoConnect: false} ),
}));
import { create } from 'zustand';
import { PlayerInfo } from '@/types/game/game';

type State = {
    players: [PlayerInfo | null, PlayerInfo | null];
    updatePlayers: (players: [PlayerInfo, PlayerInfo]) => void;
};

export const usePlayersStore = create<State>((set) => {
    return {
        players: [null, null],
        updatePlayers: (players: [PlayerInfo, PlayerInfo]) => {
            set({ players });
        },
    };
});
import { create } from 'zustand';

type State = {
    playerNames: [string, string];
    updatePlayerNames: (playerNames: [string, string]) => void;
};

export const usePlayerNamesStore = create<State>((set) => {
    return {
        playerNames: ["", ""],
        updatePlayerNames: (playerNames: [string, string]) => {
            set({ playerNames });
        },
    };
});
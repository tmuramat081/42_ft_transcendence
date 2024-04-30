import { create } from 'zustand';

type State = {
    ariasNames: [string, string];
    updateAriasNames: (ariasNames: [string, string]) => void;
};

export const useAriasNamesStore = create<State>((set) => {
    return {
        ariasNames: ["", ""],
        updateAriasNames: (ariasNames: [string, string]) => {
            set({ ariasNames });
        },
    };
});
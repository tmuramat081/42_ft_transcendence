import { create } from 'zustand';

export const PlayState = {
    stateNothing: 0,
    stateWaiting: 1,
    stateSelecting: 2,
    stateStandingBy: 3,
    statePlaying: 4,
    stateFinished: 5,
    stateCanceled: 6,
} as const;

export type PlayState = (typeof PlayState)[keyof typeof PlayState];

type State = {
    playState: PlayState;
    updatePlayState: (playState: PlayState) => void;
};

export const usePlayStateStore = create<State>((set) => {
    return {
        playState: PlayState.stateNothing,
        updatePlayState: (playState: PlayState) => {
            set({ playState });
        },
    };
});
import { GameSetting } from '../../types/game/game';
import { create } from 'zustand';

type State = {
    gameSetting: GameSetting;
    updateGameSetting: (gameSetting: GameSetting) => void;
};

const defaultGameSetting: GameSetting = {
    difficulty: 'Easy',
    matchPoint: 5,
    player1Score: 0,
    player2Score: 0,
};

export const useGameSettingStore = create<State>((set) => {
    return {
        gameSetting: defaultGameSetting,
        // ゲーム設定の更新
        updateGameSetting: (gameSetting: GameSetting) => {
            set({ gameSetting });
        },
    };
})
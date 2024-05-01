import { create } from 'zustand';

type InvitedFriendState = {
    friendId: number | null;  
};

type State = {
    invitedFriendState: InvitedFriendState;
    updateInvitedFriendState: (invitedFriendState: InvitedFriendState) => void;
};

export const useInvitedFriendStrore = create<State>((set) => {
    return {
        invitedFriendState: { friendId: null },
        // 招待されたフレンドの更新
        updateInvitedFriendState: (invitedFriendState: InvitedFriendState) => {
            set({ invitedFriendState });
        },
    };
});
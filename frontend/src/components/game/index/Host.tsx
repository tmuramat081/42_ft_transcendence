import { CircularProgress, Typography, Grid, Modal, Button } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useInvitedFriendStrore } from '@/store/game/invitedFriendState';
import { usePlayStateStore, PlayState } from '@/store/game/playState';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { usePlayersStore } from '@/store/game/player';
import { Invitation, PlayerInfo } from '@/types/game/game';
import { useAuth } from '@/providers/useAuth';
import ErrorIcon from '@mui/icons-material/Error';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import { useSocketStore } from '@/store/game/clientSocket';

export const NavigationEventsHost = (() =>{
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const updatePlayState = usePlayStateStore((store) => store.updatePlayState);
    const { socket } = useSocketStore();
    const updatePlayers = usePlayersStore((store) => store.updatePlayers);
    const router = useRouter();
    const { loginUser, getCurrentUser } = useAuth();
    const { invitedFriendState } = useInvitedFriendStrore();
    const updateInvitedFriendState = useInvitedFriendStrore((store) => store.updateInvitedFriendState);

    useEffect(() => {
      const url = `${pathname}?${searchParams}`
    //   console.log(url)
      // You can now use the current URL
      // ...
      if (invitedFriendState.friendId !== null && loginUser) {
        const invitation: Invitation = {
            guestId: invitedFriendState.friendId,
            hostId: loginUser.userId,
        };

        socket.emit('cancelInvitation', invitation);
        updateInvitedFriendState({friendId: null});
    }
        //cancelPlay();
    }, [pathname, searchParams])
   
    return null
});

export const Host = () => {
    const [invitationDenied, setInvitationDenied] = useState(false);
    const { playState, updatePlayState } = usePlayStateStore();
    const updatePlayers = usePlayersStore((store) => store.updatePlayers);
    const router = useRouter();
    const { loginUser, getCurrentUser } = useAuth();
    const { socket } = useSocketStore();
    const { invitedFriendState } = useInvitedFriendStrore();
    const updateInvitedFriendState = useInvitedFriendStrore((store) => store.updateInvitedFriendState);
    // console.log(invitedFriendState)

    useEffect(() => {
        getCurrentUser();
    }, []);

    useEffect(() => {
        if (!loginUser) {
            return ;
        }

        socket.on('friend:select', (players: [PlayerInfo, PlayerInfo]) => {
            updatePlayers(players);
            updatePlayState(PlayState.stateSelecting);
            updateInvitedFriendState({friendId: null});

            router.push('/game/battle');
        });

        socket.on('friend:standBy', (players: [PlayerInfo, PlayerInfo]) => {
            updatePlayers(players);
            updatePlayState(PlayState.stateStandingBy);
            updateInvitedFriendState({friendId: null});

            router.push('/game/battle');
        });

        socket.on('denyInvitation', () => {
            setInvitationDenied(true);
        });

        return () => {
            socket.off('friend:select');
            socket.off('friend:standBy');
            socket.off('denyInvitation');
        };
    }, [loginUser, socket, router, updateInvitedFriendState, updatePlayState, updatePlayers]);

    const cancelInvitation = useCallback(() => {
        // console.log(invitedFriendState)
        if (invitedFriendState.friendId !== null && loginUser) {
            const invitation: Invitation = {
                guestId: invitedFriendState.friendId,
                hostId: loginUser.userId,
            };

            socket.emit('cancelInvitation', invitation);
            updateInvitedFriendState({friendId: null});
        }
    }, [loginUser, invitedFriendState, socket, updateInvitedFriendState]);

    return (
        <Modal open={true} aria-labbelleby="modal-modal-title">
            <Grid container justifyContent='center' alignItems='center' direction='column' sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                width: '270px',
                height: '180px',
                borderRadius: '5px',
            }}>
                <>
                    <Grid>
                        {invitationDenied && <ErrorIcon fontSize='large' />}
                        {playState !== PlayState.stateNothing && <DoneOutlineIcon />}
                        {playState === PlayState.stateNothing && !invitationDenied && <CircularProgress />}
                    </Grid>

                    <Grid item sx={{ mt: 2}}>
                        <Typography variant='h6' id='modal-modal-title' align='center' gutterBottom>
                            {invitationDenied && 'Invitation was denied'}
                            {playState !== PlayState.stateNothing && 'waiting...'}
                            {playState === PlayState.stateNothing && !invitationDenied && 'waiting for opponent...'}
                        </Typography>
                    </Grid>
                </>
                <Grid item>
                    <Button onClick={cancelInvitation} variant='contained' color='primary'>
                        {invitationDenied ? 'Close' : 'Cancel'}
                    </Button>
                </Grid>
            </Grid>
        </Modal>
    )
}
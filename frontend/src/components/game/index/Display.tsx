/* eslint-disable */
import { Grid, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import { usePlayStateStore, PlayState } from '@/store/game/playState';
import { Start } from '@/components/game/index/Start';
import { Wait } from '@/components/game/index/Wait';
import { useAuth } from '@/providers/useAuth';
import { useInvitedFriendStrore } from '@/store/game/invitedFriendState';

export const Display = () => {
    const { loginUser, getCurrentUser } = useAuth();
    const { playState } = usePlayStateStore();
    const updatePlayState = usePlayStateStore((store) => store.updatePlayState);
    const { invitedFriendState } = useInvitedFriendStrore();
    const [ openMatchError, setOpenMatchError ] = useState(false);

    useEffect(() => {
        getCurrentUser();
    }, []);

    useEffect(() => {
        updatePlayState(PlayState.stateNothing);
    }, [updatePlayState]);

    if (loginUser === null) {
        return (
            <Grid container justifyContent="center" alignItems="center" style={{ height: "100vh" }}>
                <Paper>
                    ログインしてください
                </Paper>
            </Grid>
        )
    }

    return (
        <>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            direction="row"
            spacing={3}
            sx={{ mt: 1, height: 800}}
          >
            <Grid item xs={5} sx={{minWidth: '430px' }}>
              <Paper elevetion={3} sx={{height: '100%'}}>
                {playState === PlayState.stateNothing && (
                  <Start setOpenMatchError={setOpenMatchError} />
                )}
                {playState === PlayState.stateWaiting && (
                  <Wait openMatchError={openMatchError} />
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
    )
}
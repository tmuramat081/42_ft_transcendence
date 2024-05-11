/* eslint-disable */
import Link from 'next/link';
import { Button, Grid, Typography, Box, Paper } from '@mui/material';
import { usePlayStateStore, PlayState } from '@/store/game/playState';
import { FinishedGameInfo } from '@/types/game/game';
import { useAuth } from '@/providers/useAuth';
import { useState, useEffect, useCallback } from 'react';
import { Wait } from '../index/Wait';
import { useSocketStore } from '@/store/game/clientSocket';
import VideogameAssetSharpIcon from '@mui/icons-material/VideogameAssetSharp';
import { usePlayersStore } from '@/store/game/player';

type Props = {
    finishedGameInfo: FinishedGameInfo;
    setOpenMatchError: (open: boolean) => void;
}

// 結果を表示する

export const Result = ({ finishedGameInfo, setOpenMatchError }: Props) => {
    const { playState } = usePlayStateStore();
    const updatePlayState = usePlayStateStore((store) => store.updatePlayState);
    const { loginUser, getCurrentUser } = useAuth();

    const { socket } = useSocketStore();
    const { players } = usePlayersStore();

    useEffect(() => {
        getCurrentUser();
        //socket.on("connection")
    }, []);


    // // 何回戦目かを送れるようにする
    // // Next Gameを押したら、waitingになるようにする
    // // useCallback: 関数をメモ化する
    const start = useCallback((ariasName: string, round: number) => {
        // ログインしていない場合はエラー
        if (!loginUser) {
            //setOpenMatchError(true);
            return;
        }
        // マッチングエラーを非表示
        setOpenMatchError(false);
        // ユーザーの状態を更新
        updatePlayState(PlayState.stateWaiting);
        // マッチング開始
        //socket.emit("playStart", { userId: loginUser.userId }, ( res: Boolean ) => {
        socket.emit("playStart", { userId: loginUser.userId, aliasName: ariasName, round: round }, ( res: Boolean ) => {
            if (!res) {
                setOpenMatchError(true);
                //updatePlayState(PlayState.stateNothing);
            }
        });
        updatePlayState(PlayState.stateWaiting);
    }, [loginUser, socket, updatePlayState, setOpenMatchError]);

    // console.log(playState);

    return (
        <Grid
        container
        justifyContent="center"
        alignItems="center"
        direction="column"
        wrap="nowrap"
        sx={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          width: '25%',
          height: '50%',
        }}
      >
      {playState === PlayState.stateNothing && (
        <Grid item sx={{ mt: 3 }}>
          <Typography align="center" gutterBottom variant="h4" component="h4">
            問題が発生しました
          </Typography>
        </Grid>
      )}
      {playState === PlayState.stateCanceled && (
        <Grid item sx={{ mt: 3 }}>
          <Typography align="center" gutterBottom variant="h4" component="h4">
            キャンセルされました
          </Typography>
        </Grid>
      )}
      {playState === PlayState.stateFinished && (
        <Grid container justifyContent="space-around">
          <Grid item>
            <Typography align="center" gutterBottom variant="h3" component="h3">
              Result
            </Typography>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Typography
                align="center"
                gutterBottom
                variant="h4"
                component="h4"
              >
                Win
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                align="center"
                gutterBottom
                variant="h4"
                component="h4"
              >
                Lose
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={3} wrap="nowrap">
            <Grid item xs={6} zeroMinWidth>
              <Typography
                align="center"
                gutterBottom
                variant="h5"
                component="h5"
                noWrap
              >
                {finishedGameInfo.winnerName}
              </Typography>
            </Grid>
            <Grid item xs={6} zeroMinWidth>
              <Typography
                align="center"
                gutterBottom
                variant="h5"
                component="h5"
                noWrap
              >
                {finishedGameInfo.loserName}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Typography
                align="center"
                gutterBottom
                variant="h5"
                component="h5"
              >
                {finishedGameInfo.winnerScore}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                align="center"
                gutterBottom
                variant="h5"
                component="h5"
              >
                {finishedGameInfo.loserScore}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      )}
      <Grid item>
        <Link href="/game/index">
          <Button variant="contained">Back to Home</Button>
        </Link>
      </Grid>

      {/** room.roundを表示 */}
      {/* { finishedGameInfo.round } */}
      {finishedGameInfo.winnerName === loginUser?.userName && (
      <Grid item>
        {/* <Link href="/game/index">
          <Button variant="contained">Next Game</Button>
        </Link> */}
          <Button
            size="large"
            variant="contained"
            color="primary"
            onClick={() => start(finishedGameInfo.winnerAliasName, finishedGameInfo.round + 1)}
            endIcon={<VideogameAssetSharpIcon />}
            sx={{
                mt: 2,
                mb: 2,
                boxShadow: 8,
            }}
          >
            <Box fontWeight="fontWeightBold">
              Next Game
            </Box>
          </Button>
      </Grid>
      )}
      </Grid>
    )
}
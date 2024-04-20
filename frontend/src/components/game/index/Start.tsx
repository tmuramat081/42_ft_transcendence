import VideogameAssetSharpIcon from '@mui/icons-material/VideogameAssetSharp';
import { Button, Grid, Box, Typography, TextField } from '@mui/material'
import { usePlayStateStore, PlayState } from '@/store/game/playState';
import { useSocketStore } from '@/store/game/clientSocket';
import { useAuth } from '@/providers/useAuth';
import { Dispatch, SetStateAction, useEffect, useState, useCallback } from 'react';

type Props = {
    setOpenMatchError: Dispatch<SetStateAction<boolean>>;
};

export const Start = ({ setOpenMatchError }: Props) => {
    const { loginUser, getCurrentUser } = useAuth();
    const { socket } = useSocketStore();
    // playStateの更新関数を取得
    // (store) => store.updatePlayState: storeの中のupdatePlayStateを取得?
    const updatePlayState = usePlayStateStore((store) => store.updatePlayState);
    const [username, setUsername] = useState<string>("");

    useEffect(() => {
        getCurrentUser();
        //socket.on("connection")
    }, []);
    
    // useCallback: 関数をメモ化する
    const start = useCallback(() => {
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
        // TODO:
        // 1回線かどうかとユーザー名を送るようにする
        socket.emit("playStart", { userId: loginUser.userId }, ( res: Boolean ) => {
            if (!res) {
                setOpenMatchError(true);
                //updatePlayState(PlayState.stateNothing);
            }
        });
        updatePlayState(PlayState.stateWaiting);
    }, [loginUser, socket, updatePlayState, setOpenMatchError]);

    // loadingを表示する
    if (!loginUser) {
        return (
            <Box>
                <Typography variant="h5" align="center">
                    ログインしてください
                </Typography>
            </Box>
        );
    }

    // 画面中央にボタンを表示
    return (
        <>
          <Typography variant="h5" align="center">
            StartGame
          </Typography>

          <Grid 
            container 
            justifyContent="center"
            alignItems="center"
            direction="column"
            sx={{ height: "100vh" }}  
          >
            <Grid item xs={12}>
              <TextField
                label="Username"
                variant="outlined"
                required
                sx={{
                  mt: 2, // マージントップ
                  mb: 2, // マージンボトム
                  width: '80%' // フィールドの幅
                }}
                // onChangeイベントハンドラーでユーザー名の状態を更新します
                onChange={(e) => setUsername(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
                <Button
                  size="large"
                  variant="contained"
                  color="primary"
                  onClick={() => start()}
                  endIcon={<VideogameAssetSharpIcon />}
                  sx={{
                      mt: 2,
                      mb: 2,
                      boxShadow: 8,
                  }}
                >
                  <Box fontWeight="fontWeightBold">
                    Start
                  </Box>
                </Button>
            </Grid>
          </Grid>
        </>
    );
};
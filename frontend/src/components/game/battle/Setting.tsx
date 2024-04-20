/* eslint-disable */
import {
    CircularProgress,
    Grid,
    Typography,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
} from '@mui/material';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSocketStore } from '@/store/game/clientSocket';
import { useGameSettingStore } from '@/store/game/gameSetting';
import { PlayState, usePlayStateStore } from '@/store/game/playState';
import { DiffucultyLevel, GameSetting } from '@/types/game/game';

export const NavigationEvents = (() =>{
    const pathname = usePathname();
    const searchParams = useSearchParams();
    //const updatePlayState = usePlayStateStore((store) => store.updatePlayState);
    const { socket } = useSocketStore();
    const { playState } = usePlayStateStore();


    useEffect(() => {
      const url = `${pathname}?${searchParams}`
      console.log(url)
      // You can now use the current URL
      // ...
        const cancelOngoingBattle = () => {
            if (playState === PlayState.statePlaying) {
                socket.emit('cancelOngoingBattle');
            }
        };

        cancelOngoingBattle();

    }, [pathname, searchParams])
   
    return null
});

//ゲーム開始前の設定画面
// TODO: usernameもしくはゲスト名を入力してもらう
export const Setting = () => {
    const {socket} = useSocketStore();
    const updatePlayState = usePlayStateStore((store) => store.updatePlayState);
    const updateGameSetting = useGameSettingStore((store) => store.updateGameSetting);
    const { playState} = usePlayStateStore();
    const [difficulty, setDifficulty] = useState<DiffucultyLevel>(DiffucultyLevel.EASY);
    const [matchPoint, setMatchPoint] = useState<number>(5);
    const router = useRouter();
    const durationPfSettingInSec = 30;
    const timeoutIntervalInMilSec = 1000;
    const [countDown, setCountDown] = useState<number>(durationPfSettingInSec);
    const player1DefaultScore = 0;
    const player2DefaultScore = 0;

    const handleDifficultyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const val: DiffucultyLevel = event.target.value as DiffucultyLevel;
        console.log(val);
        setDifficulty(val);
    }

    const handleMatchPointSetting = (event: RecordingState.ChangeEvent<HTMLInputElement>) => {
        const val: number = Number(+event.target.value);
        setMatchPoint(val);
    }

    // useEffect(() => {
    //     updatePlayState(PlayState.stateSelecting);

    // }, []);

    // useEffect(() => {
    //     updatePlayState(PlayState.stateSelecting);

    // }, []);

    useEffect(() => {
        // ゲーム開始
        socket.on('playStarted', (newSetting: GameSetting) => {
            updateGameSetting(newSetting);
            updatePlayState(PlayState.statePlaying);
        });

        // エラーが発生した場合
        socket.on('error', () => {
            updatePlayState(PlayState.stateNothing);
            //router.push('/game');
        });

        // ゲームがキャンセルされた場合
        socket.on('cancelOngoingBattle', () => {
            updatePlayState(PlayState.stateCanceled);
            //router.push('/game');
        });

        // 例外が発生した場合
        socket.on('exception', () => {
            socket.emit('cancelOngoingBattle');

            updatePlayState(PlayState.stateNothing);
        });

        return () => {
            socket.off('playStarted');
            socket.off('error');
            socket.off('cancelOngoingBattle');
            socket.off('exception');
        };
    }, [socket, updatePlayState, updateGameSetting, router]);

    useEffect(() => {
        if (0 < countDown) {
            setTimeout(() => {
                setCountDown(countDown - 1);
            }, timeoutIntervalInMilSec);
            // 時間経過してもゲームが開始されない場合はキャンセル
        } else if (countDown === 0) {
            socket.emit('cancelOngoingBattle');
            updatePlayState(PlayState.stateCanceled);
        }
    }, [countDown, socket, updatePlayState]);

    // パスが変わったらゲームをキャンセル 
    // Wait.tsxを参照
    // useEffect(() => {
    //     const cancelOngoingBattle = () => {
    //         socket.emit('cancelOngoingBattle');
    //     };


    // }, []);

    // 不要では？
    useEffect(() => {
        socket.on('cancelOngoingBattle', () => {
            updatePlayState(PlayState.stateCanceled);
        });

        return () => {
            socket.off('cancelOngoingBattle');
        }
    }, []);

    // 設定を送信する。ゲーム開始
    const handleSubmit = () => {
        socket.emit('compleateSetting', {difficulty, matchPoint, player1Score: player1DefaultScore, player2Score: player2DefaultScore});
    }

    return (
        <Grid item>
            <Grid
              container
              justifyContent='center'
              alignItems='center'
              direction='column'
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                width: '25%',
                height: '25%',
              }}
              >
                {playState === PlayState.stateStandingBy && (
                    <>
                    <Grid item>
                        <CircularProgress />
                    </Grid>
                    <Grid item sx={{ mt: 3 }}>
                        <Typography variant='h6' id='modal-modal-title' align='center' gutterBottom>
                            設定中
                        </Typography>
                    </Grid>
                    </>
                )}
                {playState === PlayState.stateSelecting && (
                    <>
                    <Grid item>
                        <Grid
                          container
                          direction='column'
                          justifyContent='center'
                          alignItems='center'
                          >
                            <Grid item>
                                <Typography variant='h5'>待ち時間</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant='h5'>{countDown}</Typography>
                            </Grid>
                        </Grid>
                        <FormControl>
                            <FormLabel id="difficulty-radio-buttons-group-label">
                                Difficulty
                            </FormLabel>
                            <RadioGroup
                                row
                                aria-labelledby="difficulty-radio-buttons-group-label"
                                defaultValue={DiffucultyLevel.EASY}
                                name="difficulty-buttons-group"
                                value={difficulty}
                                onChange={handleDifficultyChange}
                            >
                                <FormControlLabel
                                value={DiffucultyLevel.EASY}
                                control={<Radio />}
                                label="Easy"
                                />
                                <FormControlLabel
                                value={DiffucultyLevel.NORMAL}
                                control={<Radio />}
                                label="Normal"
                                />
                                <FormControlLabel
                                value={DiffucultyLevel.HARD}
                                control={<Radio />}
                                label="Hard"
                                />
                            </RadioGroup>
                            <FormLabel id="matchpoint-radio-buttons-group-label">
                                Match Point
                            </FormLabel>
                            <RadioGroup
                                row
                                aria-labelledby="matchpoint-radio-buttons-group-label"
                                defaultValue="3"
                                name="matchpoint-buttons-group"
                                value={matchPoint}
                                onChange={handleMatchPointSetting}
                            >
                                <FormControlLabel value="3" control={<Radio />} label="3" />
                                <FormControlLabel value="5" control={<Radio />} label="5" />
                                <FormControlLabel value="10" control={<Radio />} label="10" />
                            </RadioGroup>
                        </FormControl>
                        <Grid
                            container
                            direction="column"
                            justifyContent="center"
                            alignItems="center"
                            >
                            <Button variant="contained" onClick={handleSubmit}>
                                Start battle!
                            </Button>
                        </Grid>
                    </Grid>
                    </>
                )}
              </Grid>
        </Grid>
    )
}
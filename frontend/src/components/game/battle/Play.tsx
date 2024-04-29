/* eslint-disable */
import { Grid, Typography, Zoom } from '@mui/material';
import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useSocketStore } from '@/store/game/clientSocket';
import { usePlayerNamesStore } from '@/store/game/playerNames';
import { PlayState, usePlayStateStore } from '@/store/game/playState';
import { GameHeader } from './GameHeader';
import { DiffucultyLevel, FinishedGameInfo, GameInfo, GameParameters } from '@/types/game/game';
import { useAuth } from '@/providers/useAuth';
import { Loading } from '../common/Loading';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useGameSettingStore } from '@/store/game/gameSetting';
import { User } from '@/types/user';
import { useAriasNamesStore } from '@/store/game/ariasNames';
import { usePlayersStore } from '@/store/game/player';

// updatePointApiを呼び出すcontroller

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

type Props = {
    updateFinishedGameInfo: (newFinishedGameInfo: FinishedGameInfo) => void;
};

// intに直す。あまり部分を切り捨てる
const convertFloatToInt = (float: number) => float - ( float % 1 );

const EASY = 6;
const NORMAL = 12;
const HARD = 30;

// barの長さを取得
const getBarLength = (canvasHeight: number, diffucultyLevel: DiffucultyLevel) => {
    switch (diffucultyLevel) {
        case DiffucultyLevel.EASY:
            return convertFloatToInt(canvasHeight / EASY);
        case DiffucultyLevel.NORMAL:
            return convertFloatToInt(canvasHeight / NORMAL);
        case DiffucultyLevel.HARD:
            return convertFloatToInt(canvasHeight / HARD);
    }
}

// ゲームのパラメータを取得
const getGameParameters = ( canvasWidth: number, diffucultyLevel: DiffucultyLevel) => {
    // windowの幅を取得
    const { innerWidth } = window;

    // topLeftX: キャンバスの左上のX座標
    const topLeftX = innerWidth === canvasWidth ? 0 : convertFloatToInt((innerWidth - canvasWidth) / 2);

    const gameParameters: GameParameters = {
        topLeftX,
        canvasWidth,
        //canvasHeight: キャンバスの高さ。キャンバスの幅の60%に相当する値。
        canvasHeight: convertFloatToInt(canvasWidth * 0.6),
        //barWidth: ゲーム中のバーの幅。キャンバス幅の2%。
        barWidth: convertFloatToInt(canvasWidth * 0.02),
        //barLength: バーの長さ。後で計算されます。
        barLength: 0,
        //player1X と player2X: プレイヤーのバーの位置。プレイヤー1はキャンバスの左端から2%の位置、プレイヤー2は右端から4%の位置に配置。
        player1X: convertFloatToInt(canvasWidth * 0.02 + topLeftX),
        player2X: convertFloatToInt(canvasWidth * 0.96 + topLeftX),
        highestPos: 0,
        lowestPos: 0,
        sideBarLeft: convertFloatToInt(canvasWidth * 0.05 + topLeftX),
        sideBarRight: convertFloatToInt(canvasWidth * 0.95 + topLeftX),
        lineDashStyle: [20, 5],
        initialHeight: 0,
        ballInitialX: convertFloatToInt(canvasWidth / 2),
        ballInitialY: 0,
        ballRadius: convertFloatToInt(canvasWidth * 0.01),
        widthRatio: 0,
    };
    gameParameters.barLength = getBarLength(gameParameters.canvasHeight, diffucultyLevel);
    gameParameters.highestPos = convertFloatToInt(gameParameters.canvasHeight / 60);
    gameParameters.lowestPos = gameParameters.canvasHeight - gameParameters.highestPos - gameParameters.barLength;
    gameParameters.initialHeight = convertFloatToInt(gameParameters.canvasHeight / 2 - gameParameters.barLength / 2);
    gameParameters.ballInitialY = convertFloatToInt(gameParameters.canvasHeight / 2);

    //widthRatio: キャンバス幅に対する比率。キャンバス幅を1000で割った値。
    gameParameters.widthRatio = gameParameters.canvasWidth / 1000;

    return gameParameters;
}

export const Play = ({ updateFinishedGameInfo }: Props) => {

    //　キャンバスの幅を取得
    // 縦長の画面の場合は、画面の高さからヘッダーとフッターの高さを引いた値を0.6で割った値を取得
    const getCanvasWidth = () => {
        const { innerWidth, innerHeight } = window;
        const heightOfHeader = 80;
        const heightOfFooter = 25;
        const widthFromHeight = convertFloatToInt((innerHeight - (heightOfHeader * 2 + heightOfFooter)) / 0.6);

        return innerWidth < widthFromHeight ? innerWidth : widthFromHeight;
    }

    const { socket } = useSocketStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { playerNames } = usePlayerNamesStore();
    //const { playState } = usePlayStateStore();
    const { gameSetting } = useGameSettingStore();
    const updateGameSetting = useGameSettingStore((store) => store.updateGameSetting);
    const updatePlayState = usePlayStateStore((store) => store.updatePlayState);
    const [gameParameter, setGameParameter] = useState(getGameParameters(getCanvasWidth(), gameSetting.difficulty));
    const [gameInfo, setGameInfo] = useState<GameInfo>({
        height1: gameParameter.initialHeight,
        height2: gameParameter.initialHeight,
        ball: {
            x: gameParameter.ballInitialX,
            y: gameParameter.ballInitialY,
            radius: gameParameter.ballRadius,
        },
    });
    const [countDown, setCountDown] = useState(3);
    const [changeCount, setChangeCount] = useState(true);
    const [isArrowDownPressed, setIsArrowDownPressed] = useState(false);
    const [isArrowUpPressed, setIsArrowUpPressed] = useState(false);

    const { ariasNames } = useAriasNamesStore();
    const { players } = usePlayersStore();

    //const { openMatchError, setOpenMatchError } = useState(false);
    
    // Userのポイントを更新する
    const updateUserPoint = (user: User, updatedPoint: number) => {
        fetch('http://localhost:3001/users/update/point', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                userId: user.userId,
                point: updatedPoint,
            }),
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error('Error');
            }
        }
        ).then((data) => {
            console.log(data);
        }
        ).catch((error) => {
            console.error('Error:', error);
        });
    }

    const {loginUser} = useAuth();
    const router = useRouter();
    // 1秒毎に表示するフレーム数
    const FPS = 60;
    // 1000 = 1s
    const waitMillSec = 1000 / FPS;

    // フィールドを描画
    const drawField = useCallback((
        ctx: CanvasRenderingContext2D,
        gameInfo: GameInfo,
        params: GameParameters,
    ) => {
        const { innerWidth, innerHeight } = window;
        // キャンバスをクリア
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        // p1のバーを描画
        ctx.fillRect(
            params.player1X,
            gameInfo.height1,
            params.barWidth,
            params.barLength,
        );
        ctx.fillRect(
            params.player2X,
            gameInfo.height2,
            params.barWidth,
            params.barLength,
        );

        // user side line
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.moveTo(params.sideBarLeft, params.highestPos);
        ctx.lineTo(params.sideBarRight, params.highestPos);

        // bottom side line
        ctx.moveTo(params.sideBarLeft, params.lowestPos + params.barLength);
        ctx.lineTo(params.sideBarRight, params.lowestPos + params.barLength);
        ctx.stroke();

        // center line
        ctx.beginPath();
        ctx.setLineDash(params.lineDashStyle);
        ctx.moveTo(params.canvasWidth / 2 + params.topLeftX, params.highestPos);
        ctx.lineTo(
            params.canvasWidth / 2 + params.topLeftX,
            params.lowestPos + params.barLength,
        );
        ctx.stroke();

        // ball
        ctx.beginPath();
        ctx.moveTo(gameInfo.ball.x + params.topLeftX, gameInfo.ball.y);
        ctx.arc(
            gameInfo.ball.x + params.topLeftX,
            gameInfo.ball.y,
            params.ballRadius,
            0,
            Math.PI * 2,
        );
        ctx.fill();
    }, 
    [],
    );

    // key event
    useEffect(() => {
        const canvas = canvasRef.current as HTMLCanvasElement;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        let animationFrameId: number;

        const onKeyDown = (e: KeyboardEvent) => {
            console.log(e.code);
            const key = e.code;
            if (!isArrowDownPressed && !isArrowUpPressed && (key === 'ArrowDown' || key === 'ArrowUp')) {
                if (key === 'ArrowDown') {
                    setIsArrowDownPressed(true);
                } else if (key === 'ArrowUp') {
                    setIsArrowUpPressed(true);
                }
            }
        };

        const onKeyUp = (e: KeyboardEvent) => {
            console.log(e.code);
            const key = e.code;
            // if (key === 'ArrowDown') {
            //     setIsArrowDownPressed(false);
            // } else if (key === 'ArrowUp') {
            //     setIsArrowUpPressed(false);
            // }

            if (key === 'ArrowDown' || key === 'ArrowUp') {
                if (isArrowDownPressed) {
                    setIsArrowDownPressed(false);
                } else if (isArrowUpPressed) {
                    setIsArrowUpPressed(false);
                }
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        const render = () => {
            drawField(context, gameInfo, gameParameter);
            // ?
            animationFrameId = window.requestAnimationFrame(render);
        }

        render();

        // ボール、バーの位置を更新
        socket.on('updateGameInfo', (newGameInfo: GameInfo) => {
            const resCaledGameInfo: GameInfo = {
                height1: convertFloatToInt(newGameInfo.height1 * gameParameter.widthRatio),
                height2: convertFloatToInt(newGameInfo.height2 * gameParameter.widthRatio),
                ball: {
                    x: convertFloatToInt(newGameInfo.ball.x * gameParameter.widthRatio),
                    y: convertFloatToInt(newGameInfo.ball.y * gameParameter.widthRatio),
                    radius: convertFloatToInt(newGameInfo.ball.radius * gameParameter.widthRatio),
                }
            }
            setGameInfo(resCaledGameInfo);
        });

        const barMove = () => {
            let move = 0;
            if (countDown === 0) {
                if (isArrowDownPressed || isArrowUpPressed) {
                    if (isArrowDownPressed) {
                        move = 1;
                    } else if (isArrowUpPressed) {
                        move = -1;
                    }
                }
                socket.emit('barMove', { move });
            }
        };

        // バーの移動を定期的に行う
        //const intervalId = loginUser && (loginUser.userName === playerNames[0] || loginUser.userName === playerNames[1]) ? setInterval(barMove, waitMillSec) : undefined;
        const intervalId = loginUser && players[0] && players[1] && (loginUser.userName === players[0].name || loginUser.userName === players[1].name) ? setInterval(barMove, waitMillSec) : undefined;


        return () => {
            window.cancelAnimationFrame(animationFrameId);
            if (intervalId) {
                clearInterval(intervalId);
            }
            socket.off('updateGameInfo');
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
        };
    }, [drawField, countDown, gameInfo, gameParameter, socket, isArrowDownPressed, isArrowUpPressed, loginUser, players, waitMillSec]) //playerNames

    useEffect(() => {
        socket.on('updateScores', (newScores: [number, number]) => {
            console.log(newScores);
            updateGameSetting({
                ...gameSetting,
                player1Score: newScores[0],
                player2Score: newScores[1],
            });
        });

        return () => {
            socket.off('updateScores');
        }
    }, [socket, gameSetting, updateGameSetting]);

    useEffect(() => {
        socket.on('finishGame', (updatedPoint: number | null, finishedGameInfo: FinishedGameInfo) => {
            if (loginUser) {
                if (updatedPoint !== null) {
                    // updatePointApiを呼び出す
                    // error時にplayStateをnottingにする
                    //updateUserPoint(loginUser, updatedPoint);
                }
            }
            //待っているプレイやーにチャットを通じて通知を送る
            
            updateFinishedGameInfo(finishedGameInfo);
            updatePlayState(PlayState.stateFinished);
        });

        socket.on('error', () => {
            console.log('error');
            updatePlayState(PlayState.stateNothing);
        })

        socket.on('exception', () => {
            console.log('exception');
            socket.emit('cancelOngoingBattle');

            updatePlayState(PlayState.stateNothing);
        });

        return () => {
            socket.off('finishGame');
            socket.off('error');
            socket.off('exception');
        };
        // API関数も含める
    }, [socket, loginUser, updateFinishedGameInfo, updatePlayState])

    // 画面のリサイズ
    useEffect(() => {
        const handleWindowResize = () => {
            setGameParameter(
                getGameParameters(getCanvasWidth(), gameSetting.difficulty),
            );
        }

        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        }
    }, [gameSetting.difficulty]);

    // パスの変更
    // Wait.tsxをさんこう
    // useEffect(() => {
    //     const cancelOngoingBattle = () => {
    //         if (playState === PlayState.statePlaying) {
    //             socket.emit('cancelOngoingBattle');
    //         }
    //     };


    // })

    // ゲーム開始のカウントダウン
    useEffect(() => {
        if (countDown > 0) {
            setTimeout(() => {
                setChangeCount(false);
            }, 800);
            setTimeout(() => {
                setCountDown(countDown - 1);
                setChangeCount(true);
            }, 1000);
        }
    }, [countDown, updatePlayState]);

    if (!loginUser) return <Loading fullSize={true} />;

    return (
        <>
        {/* {countDown !== 0 && (loginUser.userName === playerNames[0] || loginUser.userName === playerNames[1]) && ( */}
        {countDown !== 0 && (loginUser.userName === players[0].name || loginUser.userName === players[1].name) && (
            <Grid sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            }}
            >
                <Zoom in={changeCount}>
                    <Typography variant="h1" fontFamily='sans-serif'>
                        {countDown}
                    </Typography>
                </Zoom>
            </Grid>
        )}
        <div>
            {/* <GameHeader left={playerNames[0]} center='VS' right={playerNames[1]}/>
            <GameHeader left={ariasNames[0]} center='VS' right={ariasNames[1]}/> */}
            <GameHeader left={players[0].name} center='VS' right={players[1].name}/>
            <GameHeader left={players[0].aliasName} center='VS' right={players[1].aliasName}/>

            <GameHeader left={gameSetting.player1Score.toString()} center='Score' right={gameSetting.player2Score.toString()}/>
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={gameParameter.canvasHeight}
            />
            <Typography variant="h6" align="center">
                {`Difficulty: ${gameSetting.difficulty}/ MatchPoint: ${gameSetting.matchPoint}`}
            </Typography>
        </div>
        </>
    )
}
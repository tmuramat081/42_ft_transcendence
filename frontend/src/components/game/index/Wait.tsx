import {
    CircularProgress, 
    Grid,
    Typography,
    Modal,
    Button,
} from '@mui/material';
import { useCallback, useEffect, useState, Suspense, useMemo } from 'react';
import { usePlayStateStore, PlayState } from '@/store/game/playState'; 
import { useSocketStore } from '@/store/game/clientSocket';
import { usePlayerNamesStore } from '@/store/game/playerNames';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'; 
import DoneOutline from '@mui/icons-material/DoneOutline';
import { useAuth } from '@/providers/useAuth';
import ErrorIcon from '@mui/icons-material/Error';
import { Socket } from 'socket.io-client';

type Props = {
    openMatchError: boolean;
};

type NavigationEventsProps = {
    cancelPlay: () => void;
};

export const NavigationEvents = (() =>{
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const updatePlayState = usePlayStateStore((store) => store.updatePlayState);
    const { socket } = useSocketStore();

    useEffect(() => {
      const url = `${pathname}?${searchParams}`
      console.log(url)
      // You can now use the current URL
      // ...
      updatePlayState(PlayState.stateNothing);
      socket.emit("playCancel");
        //cancelPlay();
    }, [pathname, searchParams])
   
    return null
});

export const Wait = ({ openMatchError }: Props) => {
    // const pathname = useMemo(() => {usePathname()}, []);
    // const searchParams = useMemo(() => {useSearchParams()}, []);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updatePlayState = usePlayStateStore((store) => store.updatePlayState);
    const { playState } = usePlayStateStore();
    // 待機画面の表示
    const [ open, setOpen ] = useState<boolean>(true);
    const { socket } = useSocketStore();
    const { loginUser, getCurrentUser } = useAuth();

    console.log(playState)

    useEffect(() => {
        getCurrentUser();
    }, []);

    const cancelPlay = useCallback(() => {
        // プレイステートがプレイ中の場合は何もしない ゲーム中
        if (playState === PlayState.statePlaying) return;
        setOpen(false);
        updatePlayState(PlayState.stateNothing);
        socket.emit("playCancel");
    }, [playState, updatePlayState, socket]);

    const updatePlayerNames = usePlayerNamesStore((store) => store.updatePlayerNames);

    const router = useRouter();

    // setting
    useEffect(() => {
        if (loginUser === null) return ;

        // ランダム対戦
        socket.on('random:select', (playerNames: [string, string]) => {
            updatePlayerNames(playerNames);
            updatePlayState(PlayState.stateSelecting);

            // パスを変える
            void router.push('/game/battle');
        });

        // スタンバイ
        socket.on('random:standBy', (playerNames: [string, string]) => {
            updatePlayerNames(playerNames);
            updatePlayState(PlayState.stateStandingBy);

            // パスを変える
            void router.push('/game/battle');
        });

        return () => {
            socket.off('random:select');
            socket.off('random:standby');

            // cancel
            //socket.emit('playCancel');
        }

    }, [socket, loginUser, updatePlayerNames, updatePlayState, router]);

    // cancel
    // ?
    // router.events.on('routeChangeStart', cancelPlay):
    // useEffect(() => {
    //     //イベントリスナーの登録: useEffectフックが初めて実行される（コンポーネントがマウントされる）時、router.events.on('routeChangeStart', cancelPlay)によって、ルート（ページ）が変更を開始するたびにcancelPlay関数が呼び出されるように設定されます。これにより、ユーザーが新しいページに移動しようとすると、cancelPlayが実行されます。
    //     router.events.on('routeChangeStart', cancelPlay);

    //     //クリーンアップ関数の提供: useEffectのリターン文で、クリーンアップ関数を提供しています。この関数は、コンポーネントがアンマウントされる時、またはuseEffectが再実行される前に呼び出されます。この例では、router.events.off('routeChangeStart', cancelPlay)によって、cancelPlay関数へのイベントリスナーが解除されます。これは、不要になったイベントリスナーが残り続けることを防ぎ、メモリリークを避けるために重要です。
    //     return () => {
    //         router.events.off('routeChangeStart', cancelPlay);
    //     }
    // }, [router.events, cancelPlay]);

    //useEvent('routeChangeStart', cancelPlay); // イベントリスナーの登録

    // Suspense: Suspenseコンポーネントは、非同期データの読み込み中にローディングスピナーを表示するために使用されます。Suspenseコンポーネントは、非同期データを読み込むコンポーネントのラッパーとして使用されます。Suspenseコンポーネントは、非同期データの読み込みが完了するまで、その中に配置されたコンポーネントを非表示にします。非同期データの読み込みが完了すると、Suspenseコンポーネントはその中に配置されたコンポーネントを表示します。
    // fallback: fallbackプロパティは、非同期データの読み込み中に表示されるローディングスピナーを指定します。fallbackプロパティには、ローディングスピナーを表示するためのコンポーネントを指定します。この例では、nullを指定しているため、ローディングスピナーは表示されません。
    return (
        <Grid item>
            {/* <Suspense fallback={null}>
                <NavigationEvents cancelPlay={cancelPlay} />
            </Suspense> */}
            <Modal open={open} aria-labelledby='modal-modal-title'>
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
                    width: '270px',
                    height: '180px',
                    borderRadius: '10px',
                 }}
                >
                    <Grid item>
                        {playState === PlayState.stateWaiting && !openMatchError && (
                            <CircularProgress />
                        )}
                        {playState === PlayState.stateWaiting && openMatchError && (
                            <ErrorIcon fontSize='large'/>
                        )}
                    </Grid>

                    <Grid item sx={{ mt: 2 }}>
                        <Typography 
                          variant='h5'
                          id='modal-modal-title'
                          align='center'
                          gutterBottom
                        >
                            {playState === PlayState.stateWaiting && !openMatchError && (
                                'Waiting...'
                            )}
                            {playState === PlayState.stateWaiting && openMatchError && (
                                'Error'
                            )}
                            {playState === PlayState.statePlaying && (
                                'Playing...'
                            )}
                        </Typography>
                    </Grid>
                    {playState === PlayState.stateWaiting && (
                        <Grid item>
                            <Button
                              disabled={playState !== PlayState.stateWaiting}
                              variant='contained'
                              color='secondary'
                              onClick={cancelPlay}
                            >
                                Cancel
                            </Button>
                        </Grid>
                    )}
                </Grid>
            </Modal>
        </Grid>
    )
}
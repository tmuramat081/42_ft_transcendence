import VisibilityIcon from '@mui/icons-material/Visibility';
import { List, ListItemText, ListItem, Typography, Tooltip, IconButton, Pagination } from '@mui/material';
import { useAuth } from '@/providers/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSocketStore } from '@/store/game/clientSocket'; 
import { useGameSettingStore } from '@/store/game/gameSetting';
import { usePlayersStore } from '@/store/game/player';
import { PlayState, usePlayStateStore } from '@/store/game/playState';
import { GameSetting, WatchInfo, GameState, PlayerInfo } from '@/types/game/game';

export const Watch = () => {
    const { socket } = useSocketStore();
    const [ rooms, setRooms ] = useState<WatchInfo[]>([]);
    const updatePlayState = usePlayStateStore((store) => store.updatePlayState);
    const updatePlayers = usePlayersStore((store) => store.updatePlayers);
    const updateGameSetting = useGameSettingStore((store) => store.updateGameSetting);
    const router = useRouter();
    const { loginUser, getCurrentUser } = useAuth();
    const [page, setPage] = useState<number>(1);

    useEffect(() => {
        getCurrentUser();
    }, []);

    useEffect(() => {
        if (!loginUser) {
            return ;
        }

        socket.emit('watchList');
        // 自分以外の部屋を取得
        socket.on('watchListed', (rooms: WatchInfo[]) => {
            //console.log(rooms);
            
            // 自分以外の部屋を取得
            //setRooms(rooms.filter((room) => room.player1.name !== loginUser.userName && room.player2.name !== loginUser.userName));

            // 自分の部屋も取得
            setRooms(rooms);
        });

        const intervalId = setInterval(() => {
            socket.emit('watchList');
        }, 2000);

        socket.on('joinGameRoom', (gameState: GameState, gameSetting: GameSetting) => {
            if (!loginUser) {
                return ;
            }
            console.log(gameState)
            // settingの場合は待ち画面に遷移
            if (gameState === GameState.SETTING) {
                updatePlayState(PlayState.stateStandingBy);
            } else {
                updatePlayState(PlayState.statePlaying);
                updateGameSetting(gameSetting);
            }
            router.push('/game/battle');
        });

        return () => {
            clearInterval(intervalId);
            socket.off('watchListed');
            socket.off('joinGameRoom');
        }
    }, [socket, loginUser, router, updateGameSetting, updatePlayState]);

    const watchGame = (room: WatchInfo) => {
        // playerをセット
        const players: [PlayerInfo, PlayerInfo] = [room.player1, room.player2];
        socket.emit('watchGame', { roomName: room.roomName });
        updatePlayers(players);
    };

    const handleChange = (e: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const take = 5;

    return (
        <>
            <Typography variant='h2' align='center' gutterBottom noWrap sx={{mx: 'auto', width: '95%'}}>Watch Game List</Typography>
            <List sx={{width: '95%', margin: 'auto', overflow: 'auto', height: '310px'}}>
                {/* sliceで範囲を指定 */}
                {rooms?.slice((page - 1) * take, page * take).map((room) => (
                    console.log(room),
                    <ListItem key={room.roomName} sx={{ border: '1px solid' }} secondaryAction={ 
                        <Tooltip title='Watch !'>
                            <IconButton onClick={() => watchGame(room)}>
                                <VisibilityIcon />
                            </IconButton>
                        </Tooltip>
                    }>
                        <ListItemText 
                        primary={`${room.player1.name}`} 
                        primaryTypographyProps={{
                            align: 'center',
                            style: {
                                overflow: 'hidden',
                            },
                            variant: 'h6',
                        }}
                        sx={{width: '40%'}}
                        />
                        <ListItemText primary={`vs`}
                        primaryTypographyProps={{
                            align: 'center',

                            variant: 'h6',
                        }}
                        />
                        <ListItemText 
                        primary={`${room.player2.name}`} 
                        primaryTypographyProps={{
                            align: 'center',
                            style: {
                                overflow: 'hidden',
                            },
                            variant: 'h6',
                        }}
                        sx={{width: '40%'}}
                        />
                    </ListItem>
                ))}
            </List>
            <Pagination count={Math.ceil(rooms?.length / take)} page={page} onChange={handleChange} sx={{display: 'flex', justifyContent: 'center', textAlign: 'center'}}/>
        </>
    )
};
import { useState, memo, useEffect, Dispatch, SetStateAction, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Socket } from 'socket.io-client';
import Link from 'next/link';
import { ListItem, ListItemText, ListItemAvatar } from '@mui/material';
import { Friend } from '@/types/game/friend';
import { GameSetting, GameState, UserStatus } from '@/types/game/game';
import { useSocketStore } from '@/store/game/clientSocket';
import { useAuth } from '@/providers/useAuth';
import { Loading } from '../game/common/Loading';
import { usePlayersStore } from '@/store/game/player';
import { PlayState, usePlayStateStore } from '@/store/game/playState';
import { useGameSettingStore } from '@/store/game/gameSetting';
import { PlayerInfo } from '@/types/game/game';
import Avatar from '@mui/material/Avatar';
import { BadgedAvatar, AvatarFontSize } from '../game/common/BadgedAvatar';

// const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type Props = {
    friend: Friend;
    //socket: Socket;   
};

type FreindGameInfo = {
    player1: PlayerInfo;
    player2: PlayerInfo;
    gameState: GameState;
    gameSetting: GameSetting;
};

export const FriendListItem = memo(function FriendListItem({ friend }: Props) {
    const [ open, setOpen ] = useState<boolean>(true);
    const [ friendStatus, setFriendStatus ] = useState<UserStatus>(UserStatus.OFFLINE);
    const { loginUser, getCurrentUser } = useAuth();

    useEffect(() => {
        getCurrentUser();
    }, []);

    const [ error, setError ] = useState<string>('');
    const { socket: gameSocket } = useSocketStore();
    const router = useRouter();
    const updatePlayers = usePlayersStore((store) => store.updatePlayers);
    const updatePlayState = usePlayStateStore((store) => store.updatePlayState);
    const updateGameSetting = useGameSettingStore((store) => store.updateGameSetting);

    useEffect(() => {
        let ignore = false;
        
        gameSocket.emit('getUserStatusById', { userId: friend.userId }, (res: UserStatus) => {
            if (!ignore) {
                setFriendStatus(res);
            }
        });

        gameSocket.on('updateStatus', (data: { userId: number, status: UserStatus}) => {
            if (data.userId === friend.userId) {
                setFriendStatus(data.status);
            }
        });

        return () => {
            ignore = true;
            gameSocket.off('updateStatus');
        }
    }, [friend.userId, gameSocket]);


    if ( !loginUser ) {
        return <Loading />;
    }

    const handleOpen = () => {
        //setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <>
            <Link href={`/users/${friend.userName}`} passHref>
            <ListItem divider button>
                <ListItemAvatar>
                {/* <Avatar
                    alt={friend.userName}
                    src={`${API_URL}/api/uploads/${loginUser.icon}`}
                    sx={{ width: 56, height: 56, cursor: 'pointer' }}
                /> */}
                <BadgedAvatar
                    status={friendStatus}
                    src={`${API_URL}/api/uploads/${friend.icon}`}
                    displayName={friend.userName}
                    avatarFontSize={AvatarFontSize.SMALL}
                />
                </ListItemAvatar>
                <ListItemText primary={friend.userName} />
            </ListItem>
            </Link>
        </>
    )
});
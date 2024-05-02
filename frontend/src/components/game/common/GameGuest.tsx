/* eslint-disable */
import {
    Alert,
    Button,
    ButtonGroup,
    Collapse,
    Dialog,
    DialogActions,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Snackbar,
  } from '@mui/material';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
//
import { useSocketStore } from '@/store/game/clientSocket'
import { usePlayStateStore, PlayState } from '@/store/game/playState';
// friend
import { Friend } from '@/types/game/friend'
import { useRouter } from 'next/navigation';
import { usePlayerNamesStore } from '@/store/game/playerNames';
import { useAuth } from '@/providers/useAuth';
import { Invitation } from '@/types/game/game';

import { CloseButton } from '@mantine/core';
import CloseIcon from '@mui/icons-material/Close';
import { PlayerInfo } from '@/types/game/game';
import { usePlayersStore } from '@/store/game/player';

type Props = {
  hosts: Friend[];
  setHosts: Dispatch<SetStateAction<Friend[]>>;
}

export const GameGuest = ({ hosts, setHosts }: Props) => {
  const  [ openDialog, setOpenDialog ] = useState<boolean>(false);
  const [ openSnackbar, setOpenSnackbar ] = useState<boolean>(true);
  const [ openDIalogError, setOpenDialogError ] = useState<boolean>(false);
  const { socket } = useSocketStore();
  const updatePlayState = usePlayStateStore((state) => state.updatePlayState);
  const updatePlayerNames = usePlayerNamesStore((state) => state.updatePlayerNames);
  const router = useRouter();
  const { loginUser } = useAuth();
  const updatePlayers = usePlayersStore((state) => state.updatePlayers);

  console.log(hosts)

  const handleClick = useCallback(() => {
    setOpenDialog(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpenDialog(false);
  }, []);

  // 招待を受け入れる
  const handleJoinClick = useCallback((friend: Friend) => {
    if (loginUser) {
      const match: Invitation = {
        guestId: loginUser.userId,
        hostId: friend.userId,
      };
      console.log(match)
      socket.emit('acceptInvitation', match, (res: boolean) => {
        if (!res) {
          // error表示
          setOpenDialogError(true);
        }
      })
    }
  }, [loginUser, socket]);

  // 招待を拒否する
  const handleDenyClick = useCallback((friend: Friend) => {
    // 招待リストから削除
    setHosts(hosts.filter((host) => host.userId !== friend.userId));
  }, [loginUser, socket, hosts, setHosts]);

  // socketの処理
  useEffect(() => {
    if (!loginUser) return ;

    socket.on('friend:select', (players: [PlayerInfo, PlayerInfo]) => {
      //updatePlayerNames(playerNames);
      updatePlayers(players);
      updatePlayState(PlayState.stateSelecting);
      router.push('/game/battle');
    });

    socket.on('friend:standBy', (players: [PlayerInfo, PlayerInfo]) => {
      //updatePlayerNames(playerNames);
      updatePlayers(players);
      updatePlayState(PlayState.stateStandingBy);
      // 開始中のゲームがある場合は、キャンセル
      socket.emit('playCancel');
      router.push('/game/battle');
    });

    // メモリリーク対策
    return (() => {
      socket.off('friend:select');
      socket.off('friend:standBy');
    })
  }, [loginUser, socket, updatePlayState, updatePlayerNames]);

  return (
    <>
      {/* hostsがいて、openSnackbarがtrueの場合、Snackbarを表示 招待のリスト*/}
      <Snackbar 
        open={hosts.length != 0 && openSnackbar}
        message={"招待が届いています"}
        // ?
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        key={0}
        action={
          <>
            <Button onClick={handleClick} color="inherit">
              一覧を見る
            </Button>
            <CloseButton onClick={() => setOpenSnackbar(false)} />
          </>
        }
       />
       <Dialog open={openDialog}>
         <DialogTitle>Friend Match</DialogTitle>
         <Collapse in={openDIalogError}>
            <Alert
              severity="error"
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setOpenDialogError(false);
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{ mb: 2 }}
            >
              既にゲームが開始されています
            </Alert>
         </Collapse>
         <List>
            {hosts.map((host) => (
              <ListItem key={host.userId}>
                <ListItemText primary={host.userName} sx={{
                  width: '100px',
                  overdlow: 'hidden',
                  mr: '5px',
                }}/>
                <ButtonGroup>
                  <Button onClick={() => handleJoinClick(host)}>参加</Button>
                  <Button onClick={() => handleDenyClick(host)} color='error'>拒否</Button>
                </ButtonGroup>
              </ListItem>
            ))}
         </List>
         <DialogActions>
            <Button onClick={handleClose}>Close</Button>
          </DialogActions>
       </Dialog>
    </>
  )
}
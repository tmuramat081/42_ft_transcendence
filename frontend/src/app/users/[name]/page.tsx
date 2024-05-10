/* eslint-disable */
'use client';

// import { React } from 'react';
import { Grid, Typography, Alert, AlertTitle, List, ListItem, Button, ListItemText, Link } from '@mui/material';
import { Layout } from '@/components/game/common/Layout';
import { Loading } from '@/components/game/common/Loading';
import { History } from '@/components/game/index/History';
import type { NextPage } from 'next';
import Avatar from '@mui/material/Avatar';
import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/useAuth';
import { User } from '@/types/user';
import { useSocketStore } from '@/store/game/clientSocket';
import { UserStatus } from '@/types/game/game';
import { useRouter } from 'next/navigation';
import { GameRecordWithUserName } from '@/types/game/game';
import { Friend } from '@/types/game/friend';
import { Invitation } from '@/types/game/game';
import { useInvitedFriendStrore } from '@/store/game/invitedFriendState';
import { BadgedAvatar, AvatarFontSize } from '@/components/game/common/BadgedAvatar';
import { FriendListItem } from '@/components/users/FriendListItem';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function Profile({ params }: { params: { name: string } }) {
  // console.log(params.name);
  const [ user, setUser ] = useState<User | null>(null);
  const [ userStatus, setUserStatus ] = useState<UserStatus>(UserStatus.OFFLINE);
  const { loginUser, getCurrentUser } = useAuth();
  const { socket } = useSocketStore();
  const router = useRouter();
  const [userError, setUserError] = useState<Error | undefined>(undefined);
  const [records, setRecords] = useState<GameRecordWithUserName[] | undefined>(
    undefined,
  );
  const [recordsError, setRecordsError] = useState<Error | undefined>(
    undefined,
  );
  const [ranking, setRanking] = useState<number | undefined>(undefined);
  const { invitedFriendState } = useInvitedFriendStrore();
  const updateInvitedFriendState = useInvitedFriendStrore((store) => store.updateInvitedFriendState);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!user) return ;
    // console.log('getUserStatusById', user)
    socket.emit('getUserStatusById', { userId: user.userId }, (status: UserStatus) => {
      // console.log('status: ', status);
        setUserStatus(status);
    });
  }, [user, loginUser, socket]);

  // inviteGame Demo
  // 実験的に実装
  const inviteGame = (friend: Friend) => {
    // if ( userStatus !== UserStatus.ONLINE ) {
    //   // error
    //   // console.log(userStatus)
    //   // console.log(UserStatus.ONLINE)
    //   // console.log(userStatus !== UserStatus.ONLINE);
    //     return;
    // }

    // console.log("inviteGame");

    if (!loginUser) {
      return;
    }

    // TODO: aliasNameを設定できるようにする
    const invitation: Invitation = {
        guestId: friend.userId,
        hostId: loginUser.userId,
    }

    socket.emit('inviteFriend', invitation, (res: boolean) => {
      if (res) {
        updateInvitedFriendState({ friendId: friend.userId });
        // console.log(friend.userId)
        // console.log(invitedFriendState)
        router.push('/game/index');
      } else {
        // error
        console.log('error');
      }
    });
  }

  // updatetanking
  useEffect(() => {
    fetch(API_URL + '/users/ranking/' + params.name, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
    .then((res) => res.json())
    .then((data) => {
      // console.log('data: ', data);
      setRanking(data.ranking);
      return data;
    })
    .catch((error) => {
      console.log(error);
    });
  }, [user, socket, params.name, router])

  // updateRecords
  useEffect(() => {
    if (user === null) {
      return;
    }
    fetch(API_URL + '/game-room/records/' + user.userId, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
    .then((res) => res.json())
    .then((data) => {
      // console.log('data: ', data);
      setRecords(data.records);
      return data;
    })
    .catch((error) => {
      setRecordsError(error as Error);
      console.log(error);
    });
  }, [user, socket, params.name, router])

  useEffect(() => {
    // サーバーサイドでの処理なのでhttp://localhost:3001は使えない
    // そのため、http://backend:3000を使う
    fetch("http://localhost:3001/users/" + params.name, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
    })
    .then((res) => res.json())
    .then((data) => {
        // console.log("data: ", data);
        setUser(data.user);
        // console.log('getUserStatusById', data.user)
        socket.emit('getUserStatusById', { userId: data.user.userId }, (status: UserStatus) => {
          // console.log('status: ', status);
          setUserStatus(status);
        });
        return data;
    })
    .catch((error) => {
        setUserError(error as Error);
        console.log(error);
    });

    socket.on('updateStatus', (data: { userId: number, status: UserStatus }) => {
        if (data.userId === user?.userId) {
            // setUser((prev) => {
            //     if (prev === null) {
            //         return null;
            //     }
            //     return { ...prev, status: data.status };
            // });
            setUserStatus(data.status);
        }
    })

    return () => {
        socket.off('updateStatus');
    }
  }, [socket, params.name, router]);

  const handleAddFriend = () => {
    if (user === null) {
        return;
    }
    console.log('friend');
    
    fetch("http://localhost:3001/users/friend/add/" + user.userName, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
    })
    .then((res) => res.json())
    .then((data) => {
            // console.log("data: ", data);
            getCurrentUser();
            return data;
        }
    )
    .catch((error) => {
        console.log(error);
    });
  }

  const handleRemoveFriend = () => {
    if (user === null) {
        return;
    }
    console.log('friend');
    
    fetch("http://localhost:3001/users/friend/remove/" + user.userName, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
    })
    .then((res) => res.json())
    .then((data) => {
            // console.log("data: ", data);
            getCurrentUser();
            return data;
        }
    )
    .catch((error) => {
        console.log(error);
    });
  }


  const handleBlockUser = () => {
    if (user === null) {
        return;
    }
    // console.log('block');

    fetch("http://localhost:3001/users/block/" + user.userName, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
    })
    .then((res) => res.json())
    .then((data) => {
            // console.log("data: ", data);
            getCurrentUser();
            return data;
        }
    )
    .catch((error) => {
        console.log(error);
    });
  }

  const handleUnblockUser = () => {
    if (user === null) {
        return;
    }
    // console.log('unblock');

    fetch("http://localhost:3001/users/unblock/" + user.userName, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
    })
    .then((res) => res.json())
    .then((data) => {
            // console.log("data: ", data);
            getCurrentUser();
            return data;
        }
    )
    .catch((error) => {
        console.log(error);
    });
  }

  if (userError !== undefined || recordsError !== undefined) {
    // if (!router.isReady) {
    //   return <Loading fullSize />;
    // } else {
    //   return (
    //     <Layout title="Profile">
    //       <Alert severity="error">
    //         <AlertTitle>Error</AlertTitle>
    //         {userError !== undefined && <p>User Fetching Error</p>}
    //         {recordsError !== undefined && <p>Game Records Fetching Error</p>}
    //       </Alert>
    //     </Layout>
    //   );
    // }
      return (
      <Layout title="Profile">
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {userError !== undefined && <p>User Fetching Error</p>}
          {recordsError !== undefined && <p>Game Records Fetching Error</p>}
        </Alert>
      </Layout>
  }

  // TODO: リダイレクトさせる
  if (!loginUser || !user) {
    return <Loading fullSize />;
  } 

  // status 済み
  // addFriend, removeFriend, block, unblock　済み
  // friends 済み
  // records 済み
  // ranking 済み
  // points　済み
  return (
    <Layout title='Profile'>
      <Grid container direction='column' alignItems='center' spacing={2} sx={{ p: 2 }}>
        <Grid item>
          {/* <Avatar alt={user?.userName} src={API_URL + '/api/uploads/' + user?.icon} />
          <Typography gutterBottom variant='h1' component='div' align='center' sx={{ wordBreak: 'break-word' }}>{userStatus}</Typography> */}
          <BadgedAvatar status={userStatus} width={150} height={150} src={API_URL + '/api/uploads/' + user?.icon} displayName={user?.userName} avatarFontSize={AvatarFontSize.LARGE} />
        </Grid>
        <Grid item>
          <Typography gutterBottom variant='h1' component='div' align='center' sx={{ wordBreak: 'break-word' }}>{user?.userName}</Typography>
        </Grid>
        <Grid container direction='row' justifyContent='center' spacing={5}>
          <Grid item>
            <Grid container direction='column' alignItems='center'>
              {/* <Grid item>
                <Typography gutterBottom variant='h5' component='div'>
                  Rank
                </Typography>
              </Grid>
              <Grid item>
                <Typography gutterBottom variant='h4' component='div'>
                  {ranking === undefined ? '-' : ranking}
                </Typography>
              </Grid> */}
              { loginUser !== null && user !== null && loginUser.userId !== user.userId && loginUser.friends.filter((friend) => friend.userId === user.userId).length <= 0 &&
                (
                    <Button variant='contained' sx={{width: '100%'}} color='primary' onClick={handleAddFriend}>友達になる</Button>
                )
              }  
              { loginUser !== null && user !== null && loginUser.userId !== user.userId && loginUser.friends.filter((friend) => friend.userId === user.userId).length > 0 &&
                (
                    <Button variant='contained' sx={{width: '100%'}} color='secondary' onClick={handleRemoveFriend}>友達を外す</Button>
                )
              }  
            </Grid>
          </Grid>
          <Grid item>
            <Grid container direction='column' alignItems='center'>
              {/* <Grid item>
                <Typography gutterBottom variant='h5' component='div'>
                  Point
                </Typography>
              </Grid>
              <Grid item>
                <Typography gutterBottom variant='h4' component='div'>
                  {user?.point}
                </Typography>
              </Grid> */}

              { loginUser !== null && user !== null && loginUser.userId !== user.userId && loginUser.blocked.filter((friend) => friend.userId === user.userId).length <= 0 &&
                (
                    <Button variant='contained' sx={{width: '100%'}} color='primary' onClick={handleBlockUser}>ブロックする</Button>
                )
              }  
              { loginUser !== null && user !== null && loginUser.userId !== user.userId && loginUser.blocked.filter((friend) => friend.userId === user.userId).length > 0 &&
                (
                    <Button variant='contained' sx={{width: '100%'}} color='secondary' onClick={handleUnblockUser}>アンブロック</Button>
                )
              }  
            </Grid>
          </Grid>

          <Grid item>
            <Grid container direction='column' alignItems='center'>
              {/* <Grid item>
                <Typography gutterBottom variant='h5' component='div'>
                  Point
                </Typography>
              </Grid>
              <Grid item>
                <Typography gutterBottom variant='h4' component='div'>
                  {user?.point}
                </Typography>
              </Grid> */}
              { loginUser !== null && user !== null && loginUser.userId !== user.userId && loginUser.blocked.filter((friend) => friend.userId === user.userId).length <= 0 &&
                (
                    <Button variant='contained' sx={{width: '100%'}} color='primary' onClick={() => inviteGame({userId: user.userId, userName: user.userName})}>ゲームに誘う</Button>
                )
              }  
            </Grid>
          </Grid>
        </Grid>

        <Grid container direction='row' justifyContent='center' spacing={5}>
          <Grid item>
            <Grid container direction='column' alignItems='center'>
              <Grid item>
                <Typography gutterBottom variant='h5' component='div'>
                  Rank
                </Typography>
              </Grid>
              <Grid item>
                <Typography gutterBottom variant='h4' component='div'>
                  {ranking === undefined ? '-' : ranking}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container direction='column' alignItems='center'>
              <Grid item>
                <Typography gutterBottom variant='h5' component='div'>
                  Point
                </Typography>
              </Grid>
              <Grid item>
                <Typography gutterBottom variant='h4' component='div'>
                  {user?.point}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {/* Friend list */}
        <Grid container direction='row' justifyContent='center' spacing={5}>
          <Grid item>
            <Grid container direction='column' alignItems='center'>
              <Typography gutterBottom variant='h5' component='div'>
                Friends
              </Typography>
              <List>
                {user && user.friends && user.friends.map((friend, index) => (
                  // <ListItem key={index}>
                  //   <Link href={`/users/${friend.userName}`}>
                  //   <Avatar alt={friend.userName} src={API_URL + '/api/uploads/' + friend.icon} />
                  //   <ListItemText primary={friend.userName} secondary={`${friend.userName}`} />
                  //   </Link>
                  // </ListItem>
                  <FriendListItem key={index} friend={{userId: friend.userId, userName: friend.userName}} />
                ))}
              </List>
            </Grid>
          </Grid>
        {/* Match results */}
          <Grid item>
            <Grid container direction='column' alignItems='center'>
              <Typography gutterBottom variant='h5' component='div'>
                GameHistory
              </Typography>
              {/* <List>
                {records && records.map((match, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`Match ${index + 1}: ${match.winnerName} VS ${match.loserName}`} />
                  </ListItem>
                ))}
              </List> */}
              <History user={user} records={records} />

            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Layout>
  );
}
// サンプル用クライアントレンダリングでしかできなさそう
/* eslint-disable */

'use client';

import Avatar from '@mui/material/Avatar';
import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/useAuth';
import { User } from '@/types/user';
import { useSocketStore } from '@/store/game/clientSocket';
import { UserStatus } from '@/types/game/game';
import { Friend } from '@/types/game/friend';
import { Invitation } from '@/types/game/game';
import { Loading } from '@/components/game/common/Loading';
import { useInvitedFriendStrore } from '@/store/game/invitedFriendState';
import { useRouter } from 'next/navigation';

export default function functionPage({ params }: { params: { name: string } }) {
  console.log(params.name);
  const [ user, setUser ] = useState<User | null>(null);
  const [ userStatus, setUserStatus ] = useState<UserStatus>(UserStatus.OFFLINE);
  const { loginUser, getCurrentUser } = useAuth();
  const { socket } = useSocketStore();
  const updateInvitedFriendState = useInvitedFriendStrore((store) => store.updateInvitedFriendState);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser();
  }, []);


  if (!loginUser) {
    return <Loading />;
  } 

  // 実験的に実装
  const inviteGame = (friend: Friend) => {
    if ( userStatus !== UserStatus.ONLINE ) {
      // error
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
        router.push('/game/index');
      } else {
        // error
        console.log('error');
      }
    });
  }

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
        console.log("data: ", data);
        setUser(data.user);
        socket.emit('getUserStatusById', { userId: data.user.userId }, (status: UserStatus) => {
            setUserStatus(status);
        });
        return data;
    })
    .catch((error) => {

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
  }, [socket, params.name]);

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
            console.log("data: ", data);
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
            console.log("data: ", data);
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
    console.log('block');

    fetch("http://localhost:3001/users/block/" + user.userName, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
    })
    .then((res) => res.json())
    .then((data) => {
            console.log("data: ", data);
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
    console.log('unblock');

    fetch("http://localhost:3001/users/unblock/" + user.userName, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
    })
    .then((res) => res.json())
    .then((data) => {
            console.log("data: ", data);
            getCurrentUser();
            return data;
        }
    )
    .catch((error) => {
        console.log(error);
    });
  }


  return (
    <div>
      { user === null && <h1>ユーザーが見つかりません</h1> }

      { user !== null && (
        <div>
          <h1>{ user.userName }</h1>
          <h1> { userStatus } </h1>
          <p>{ user.email }</p>
          <p>{ user.userId }</p>
          <p>{ user.icon }</p>
          <Avatar alt={user.userName} src={ 'http://localhost:3001/api/uploads/' + user.icon } />

          { loginUser !== null && loginUser.userId !== user.userId && loginUser.friends.filter((friend) => friend.userId === user.userId).length <= 0 &&
            (
                <button onClick={handleAddFriend}>友達になる</button>
            )
          }  
          { loginUser !== null && loginUser.userId !== user.userId && loginUser.friends.filter((friend) => friend.userId === user.userId).length > 0 &&
            (
                <button onClick={handleRemoveFriend}>友達を外す</button>
            )
          }  

          { loginUser !== null && loginUser.userId !== user.userId && loginUser.blocked.filter((friend) => friend.userId === user.userId).length <= 0 &&
            (
                <button onClick={handleBlockUser}>ブロックする</button>
            )
          }  
          { loginUser !== null && loginUser.userId !== user.userId && loginUser.blocked.filter((friend) => friend.userId === user.userId).length > 0 &&
            (
                <button onClick={handleUnblockUser}>アンブロック</button>
            )
          }  

          <h2>Friend List</h2>
          { loginUser !== null && loginUser.friends.map((friend) => {
            return (
                <div>
                    <p key={ friend.userName }>{ friend.userName }</p>
                    <Avatar alt={ friend.userName } src={ 'http://localhost:3001/api/uploads/' + friend.icon } />
                </div>
            )
          })}

          <h2>Block List</h2>
          { loginUser !== null && loginUser.blocked.map((block) => {
            return (
                <div>
                    <p key={ block.userName }>{ block.userName }</p>
                    <Avatar alt={ block.userName } src={'http://localhost:3001/api/uploads/' + block.icon } />
                </div>
            )
          })}

        </div>
      )}
    </div>
  );
}
/* eslint-disable */

// サーバーサイドでの処理
//"use client";

// import Avatar from '@mui/material/Avatar';

// export default async function Page({ params }: { params: { name: string } }) {
//     console.log(params.name);

//     // user情報を取得する

//     //const res = await fetch(`http://localhost:3001/users/${params.name}`);

//     // サーバーサイドでの処理なのでhttp://localhost:3001は使えない
//     // そのため、http://backend:3000を使う
//     const res = await fetch("http://backend:3000/users/" + params.name, {
//         method: "GET",
//         headers: { "Content-Type": "application/json" },
//         credentials: 'include',
//       })
//       .then((res) => res.json())
//       .then((data) => {

//           console.log("data: ", data);
//           return data;
//       })
//       .catch((error) => {

//           console.log(error);
//       });

//       // テスト
//     console.log("res: ", res);

//     const user = res.user;
    
//   return (
//     <div>
//       <h1>{user.userName}</h1>
//       <p>{user.email}</p>
//       <p>{user.userId}</p>
//       <p>{user.icon}</p>
//       <Avatar alt={user.userName} src={"http://localhost:3001/api/uploads/" + user.icon} />
//     </div>
//   );
// }

// クライアントサイド
// profileを真似する
'use client';

import Avatar from '@mui/material/Avatar';
import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/useAuth';
import { User } from '@/types/user';
import { useSocketStore } from '@/store/game/clientSocket';
import { UserStatus } from '@/types/game/game';

export default function functionPage({ params }: { params: { name: string } }) {
  console.log(params.name);
  const [ user, setUser ] = useState<User | null>(null);
  const [ userStatus, setUserStatus ] = useState<UserStatus>(UserStatus.OFFLINE);
  const { loginUser, getCurrentUser } = useAuth();
  const { socket } = useSocketStore();

  useEffect(() => {
    getCurrentUser();
  }, []);

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
    <>
      <
    </>
  );
}
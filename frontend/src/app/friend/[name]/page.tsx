// サンプル用クライアントレンダリングでしかできなさそう

"use client";

import Avatar from '@mui/material/Avatar';
import {useEffect, useState} from 'react';
import { useAuth } from '@/providers/useAuth';
import { User } from '@/types/user';

export default function functionPage({ params }: { params: { name: string } }) {
    console.log(params.name);

    // user情報を取得する

    //const res = await fetch(`http://localhost:3001/users/${params.name}`);

    const [user, setUser] = useState<User | null>(null);
    // すでに友達かどうか

    const { loginUser, getCurrentUser } = useAuth();

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
            return data;
        })
        .catch((error) => {

            console.log(error);
        });

        // テスト
        //console.log("res: ", res);

        //const user = res.user;

        //setUser(res.user);
    }, []);

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
      {user === null && <h1>ユーザーが見つかりません</h1>}

      {user !== null && (
        <div>
            <h1>{user.userName}</h1>
            <p>{user.email}</p>
            <p>{user.userId}</p>
            <p>{user.icon}</p>
            <Avatar alt={user.userName} src={"http://localhost:3001/api/uploads/" + user.icon} />

            {loginUser !== null && loginUser.userId !== user.userId && loginUser.friends.filter((friend) => friend.userId === user.userId).length <= 0 &&
                (
                    <button onClick={handleAddFriend}>友達になる</button>
                )
            }  
            {loginUser !== null && loginUser.userId !== user.userId && loginUser.friends.filter((friend) => friend.userId === user.userId).length > 0 &&
                (
                    <button onClick={handleRemoveFriend}>友達を外す</button>
                )
            }  

            {loginUser !== null && loginUser.userId !== user.userId && loginUser.blocked.filter((friend) => friend.userId === user.userId).length <= 0 &&
                (
                    <button onClick={handleBlockUser}>ブロックする</button>
                )
            }  
            {loginUser !== null && loginUser.userId !== user.userId && loginUser.blocked.filter((friend) => friend.userId === user.userId).length > 0 &&
                (
                    <button onClick={handleUnblockUser}>アンブロック</button>
                )
            }  

            <h2>Friend List</h2>
            {loginUser !== null && loginUser.friends.map((friend) => {
                return (
                    <div>
                        <p key={friend.userName}>{friend.userName}</p>
                        <Avatar alt={friend.userName} src={"http://localhost:3001/api/uploads/" + friend.icon} />
                    </div>
                )
            })}

            <h2>Block List</h2>
            {loginUser !== null && loginUser.blocked.map((block) => {
                return (
                    <div>
                        <p key={block.userName}>{block.userName}</p>
                        <Avatar alt={block.userName} src={"http://localhost:3001/api/uploads/" + block.icon} />
                    </div>
                )
            })}

        </div>
    )}
    </div>
  );
}
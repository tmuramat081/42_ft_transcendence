// サンプル用クライアントレンダリングでしかできなさそう

"use client";

import Avatar from '@mui/material/Avatar';
import {useEffect, useState} from 'react';

export default function functionPage({ params }: { params: { name: string } }) {
    console.log(params.name);

    // user情報を取得する

    //const res = await fetch(`http://localhost:3001/users/${params.name}`);

    const [user, setUser] = useState(null);
    // すでに友達かどうか
    const [isFriend, setIsFriend] = useState(false);

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

    const handleFriend = () => {
        console.log('friend');
        
        fetch("http://localhost:3001/friends/" + user.userName, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
        })
        .then((res) => res.json())
        .then((data) => {
                console.log("data: ", data);
                setIsFriend(true);
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
        </div>
    )}
    </div>
  );
}
// サーバーサイドでの処理
//"use client";

import Avatar from '@mui/material/Avatar';

type User = {
    userId: string;
    userName: string;
    email: string;
    icon: string;
    twoFactorAuth: boolean;
    twoFactorAuthNow: boolean;
}

export default async function Page({ params }: { params: { name: string } }) {
    //console.log(params.name);

    // user情報を取得する

    //const res = await fetch(`http://localhost:3001/users/${params.name}`);

    // サーバーサイドでの処理なのでhttp://localhost:3001は使えない
    // そのため、http://backend:3000を使う
    const res = await fetch("http://backend:3000/users/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      })
      .then((res) => res.json())
      .then((data) => {

          //console.log("data: ", data);
          return data;
      })
      .catch((error) => {

          console.log(error);
      });


      // なぜres.usersがundefinedなのか？
      // SSRだとキャッシュが残るらしい
    console.log("res: ", res);

    const users = res.users;

    users.forEach((user: User) => {
        console.log("user: ", user.userName);
    });

    //console.log("users: ", users);
    
  return (
    <div>
        {users.map((user: User) => (
            <div key={user.userId}>
                <h1>{user.userName}</h1>
                <p>{user.email}</p>
                <p>{user.userId}</p>
                <p>{user.icon}</p>
                <Avatar alt={user.userName} src={"http://localhost:3001/api/uploads/" + user.icon} />
            </div>
        ))}
    </div>
  );
}
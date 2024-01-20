"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
//import { useHistory, useLocation } from 'react-router-dom';
//import { useRouter } from 'next/router';
//import Router from 'next/router'
//import { redirect } from 'next/navigation'
//https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating
import { useRouter } from 'next/navigation'
import { jwtDecode } from "jwt-decode";

type User = {
    userId: number,
    userName: string,
    email: string,
    password: string,
    createdAt: Date,
};

export default function Form() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState({});
    const [token, setToken] = useState('');
    const router = useRouter();

    useEffect(() => {
        //if (token == '' || token === undefined) return;
        getCurrentUser();
    }, []);

    useEffect(() => {
        //if (token == '' || token === undefined) return;
        //console.log('user: ', user);
        if (!user || token == '' || token === undefined) {
            return
        }

        // console.log('user: ', user);
        // console.log('token: ', token);
        const decode = jwtDecode(token);
        // console.log('decode: ', decode['twoFactorAuth']);
        // console.log(user.twoFactorAuth)
        // console.log("if: ", decode['twoFactorAuth'] === false && user.twoFactorAuth === true)
        if (decode['twoFactorAuth'] === false && user.twoFactorAuth === true) {
            router.push('/users/2fa')
            return
        }
        router.push('/');
    })

    const getCurrentUser = () => {
        fetch('http://localhost:3001/users/me', {
            method: 'GET',
            credentials: 'include',
            // headers: {
            //     "Authorization": `Bearer ${token}`
            // }
        })
        .then((res) => {
            //console.log(res.data);
            return res.json();
        })
        .then((data) => {
            console.log('Success:', data);
            setUser(data.user);
            //router.push('/');
            //Router.push('/');
            //redirect('/');
        })
        .catch((error) => {
            console.error('Error:', error);
            
            // redirect
        });
    }

    // mfnyuを参考にしてloginをさんこう　 if res.status == 200 でtokenをsetToken
    const handleSubmit = (e) => {
        e.preventDefault();
        // ここでフォームのデータを処理します
        // axios.post('localhost:3001/users/login', { username, email });
        fetch('http://localhost:3001/users/signin', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName, password }),
        })
        .then ((res) => {
            // /console.log(res.json());
            return res.json();
        })
        //.then((res) => res.json())
        .then((data) => {
            console.log('Success:', data.accessToken);
            setToken(data.accessToken);
            getCurrentUser();
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        console.log('送信されたデータ:', { userName, password });
        // 送信後の処理（例: フォームをクリアする）
        setUserName('');
        setPassword('');
    };
    
    return (
        <div>
        <form onSubmit={handleSubmit}>
            <label htmlFor="username">名前:</label>
            <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            />
    
            <label htmlFor="password">パスワード:</label>
            <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
    
            <button type="submit">送信</button>

            <p>AccessToken: {token}</p>
            
            { user && 
                <p>user: {user.userName}</p>
            } { !user && 
                <p>user: </p>
            }

        </form>

        <button onClick={() => Router.push('/auth/signup')}>signup</button>

        <button>
            <a href="http://localhost:3001/auth/callback/42">42ログイン</a>
        </button>
        </div>
    );
    }
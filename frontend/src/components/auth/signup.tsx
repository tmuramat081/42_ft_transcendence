"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
//import { useHistory, useLocation } from 'react-router-dom';
import { Router, useRouter } from 'next/router';

export default function Form() {
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [user, setUser] = useState({});

    const [token, setToken] = useState('');

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
            Router.push('/');
        })
        .catch((error) => {
            console.error('Error:', error);

            // redirect
        });
    }


    useEffect(() => {
        //if (token == '' || token === undefined) return;
        getCurrentUser();
    }, []);


    
    const handleSubmit = (e) => {
        e.preventDefault();
        // ここでフォームのデータを処理します
        // axios.post('localhost:3001/users/login', { username, email });
        fetch('http://localhost:3001/users/signup', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName, email, password, passwordConfirm }),
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
        setEmail('');
        setPassword('');
        setPasswordConfirm('');
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

            <label htmlFor="emaile">email:</label>
            <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
    
            <label htmlFor="password">パスワード:</label>
            <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />

            <label htmlFor="password">パスワード確認:</label>
            <input
            type="passwordConfirm"
            id="passwordConfirm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            />
    
    
            <button type="submit">送信</button>

            <p>AccessToken: {token}</p>
            
            { user && 
                <p>user: {user.userName}</p>
            } { !user && 
                <p>user: </p>
            }

        </form>
        </div>
    );
    }
"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
//import { useHistory, useLocation } from 'react-router-dom';
import { Router, useRouter } from 'next/router';

import styles from  "./toggleSwitch.module.css"

export default function Form() {
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [file, setFile] = useState(null);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);
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
            setUserName(data.user.userName);
            setEmail(data.user.email);
            setTwoFactorAuth(data.user.twoFactorAuth);
            //Router.push('/');
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

        // ここにフォームデータの送信ロジックを追加します
        // console.log('ファイル:', file);
        // console.log('2FA有効:', is2FAEnabled);

        // fetch('http://localhost:3001/users/signup', {
        //     method: 'POST',
        //     credentials: 'include',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ userName, email, password, passwordConfirm }),
        // })
        // .then ((res) => {
        //     // /console.log(res.json());
        //     return res.json();
        // })
        // //.then((res) => res.json())
        // .then((data) => {
        //     console.log('Success:', data.accessToken);
        //     setToken(data.accessToken);
        //     getCurrentUser();
        // })
        // .catch((error) => {
        //     console.error('Error:', error);
        // });

        // var formData = new FormData()
        // formData.append('userName', userName)
        // formData.append('email', email)


        fetch("http://localhost:3001/users/update", {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName, email, password, passwordConfirm, twoFactorAuth }),
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



        // console.log('送信されたデータ:', { userName, password });
        // // 送信後の処理（例: フォームをクリアする）
        setUserName('');
        setEmail('');
        setPassword('');
        setPasswordConfirm('');
        setFile(null);
        setTwoFactorAuth(false);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };
    
    const handle2FAToggle = (e) => {
        setTwoFactorAuth(e.target.checked);
    };
    
    return (
        <div>
        <form onSubmit={()=>{}}>
            <div>
            <label htmlFor="fileInput">画像ファイル：</label>
            <input type="file" id="fileInput" onChange={handleFileChange} />
            </div>
            <button type="submit">送信</button>
        </form>
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

            {/* <div>
            <label htmlFor="2faToggle">2FA：</label>
            <input type="checkbox" id="2faToggle" checked={is2FAEnabled} onChange={handle2FAToggle} />
            <span>{is2FAEnabled ? '有効' : '無効'}</span>
            </div>
     */}
            <div>
            <label className={styles.switch}>
            <input
              type="checkbox"
              checked={twoFactorAuth}
              onChange={handle2FAToggle}
            />
            <span className={styles.slider}></span>
            </label>
            <span>{twoFactorAuth ? '2FA有効' : '2FA無効'}</span>
            </div>
    
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
/* eslint-disable */
"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
//import { useHistory, useLocation } from 'react-router-dom';

import styles from  "./toggleSwitch.module.css"
import Modal from './2fa/modal'; // Modalコンポーネントをインポート
import { usePrivateRoute } from '@/hooks/routes/usePrivateRouter';
import { useAuth } from '@/providers/useAuth';
import { useRouter } from 'next/navigation'; 
import Avatar from '@mui/material/Avatar';

export default function Form() {
    const {loginUser, getCurrentUser, loading} = useAuth();

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);
    //const [user, setUser] = useState({});

    const [token, setToken] = useState('');

    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [code, setCode] = useState('');


    const router = useRouter();

    // console.log(userName)
    // console.log(email)
    // console.log(password)
    // console.log(passwordConfirm)
    // console.log(file)
    // console.log(twoFactorAuth)
    // console.log(token)
    // console.log(qrCodeUrl)
    // console.log(code)


    // const getCurrentUser = () => {
    //     fetch('http://localhost:3001/users/me', {
    //         method: 'GET',
    //         credentials: 'include',
    //         // headers: {
    //         //     "Authorization": `Bearer ${token}`
    //         // }
    //     })
    //     .then((res) => {
    //         //console.log(res.data);
    //         return res.json();
    //     })
    //     .then((data) => {
    //         console.log('Success:', data);
    //         setUser(data.user);
    //         setUserName(data.user.userName);
    //         setEmail(data.user.email);
    //         setTwoFactorAuth(data.user.twoFactorAuth);
    //         //Router.push('/');
    //     })
    //     .catch((error) => {
    //         console.error('Error:', error);

    //         // redirect
    //     });
    // }


    console.log("update")


    useEffect(() => {
        //if (token == '' || token === undefined) return;
        // const callback = () => {
        //     router.push('/auth/signin')
        // }
        //getCurrentUser(callback);

        getCurrentUser();
    }, []);

    useEffect(() => {
        if (loginUser) {
            setUserName(loginUser.userName);
            setEmail(loginUser.email);
            setTwoFactorAuth(loginUser.twoFactorAuth);
            //setUser(loginUser);
        }
    }, [loginUser]);


    //getCurrentUser();

    //usePrivateRoute();

    // useEffect(() => {
    //     console.log(loginUser)
    //     if (!loginUser) {
    //         router.push('/auth/signin')
    //     }
    // }, [loginUser])

    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        // URLに変換してプレビューを表示
        // mfny参考
        setFile(e.target.files[0]);


    };

    const handleSubmitIcon = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('icon', file as Blob);

        console.log('formData:', formData.get('icon'));

        fetch('http://localhost:3001/users/update/icon', { 
            method: 'POST',
            credentials: 'include',
            body: formData,
        })
        .then((res) => {
            // access response data here
            return res.json();
        })
        .then((data) => {
            console.log('Success:', data);
            getCurrentUser();
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    }
    
    const handle2FAToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTwoFactorAuth(e.target.checked);
    };

    const handleSubmit2Fa = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // ここに2FAコードを検証するロジックを追加
        console.log('Submitted 2FA code:', code);
        console.log('loginUser: ', loginUser?.userId);
  
        fetch("http://localhost:3001/auth/2fa/verify", {
          method: 'POST',
          credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },

          body: JSON.stringify({ userId: loginUser?.userId, code: code }),
          // headers: {
          //     "Authorization": `Bearer ${token}`
          // }
          })
          .then((res) => {
              //console.log(res.data);
              return res.json();
          })
          .then((data) => {
              console.log('Success:', data.accessToken);
              setShowModal(false)
          })
          .catch((error) => {
              console.error('Error:', error);
  
              // redirect
          });
      };
    
    const [showModal, setShowModal] = useState(false);
  
    // 2FA有効化時にモーダルを表示
    const enableTwoFactorAuth = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTwoFactorAuth(e.target.checked);
      if (e.target.checked) {
          setShowModal(true);
          // ここに2FA有効化のロジックを追加
          // const response = await fetch('http://localhost:3001/auth/2fa/generate');
          // const data = await response.json();
          // setQrCodeUrl(data.qrCode);
  
          fetch('http://localhost:3001/auth/2fa/generate', {
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
              console.log('Success:', data.qrCord);
              setQrCodeUrl(data.qrCord);
              //setShowModal(false)
              //console.log('QRコード:', qrCodeUrl);
              //Router.push('/');
          })
          .catch((error) => {
              console.error('Error:', error);
  
              // redirect
          });
      } else {
          // ここに2FA無効化のロジックを追加
          // const response = await fetch('http://localhost:3001/auth/2fa/disable');
          // const data = await response.json();
          // console.log('2FA無効化:', data);
          fetch('http://localhost:3001/auth/2fa/disable', {
              method: 'POST',
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
              //Router.push('/');
          })
          .catch((error) => {
              console.error('Error:', error);
  
              // redirect
          });
      }
    };

    if (loading || !loginUser) {
        return <p>loading...</p>
    }
    
    return (
        <div>
            <div>
            <h1>ユーザー情報更新</h1>
            <Avatar alt={loginUser.userName} src={"http://localhost:3001/users/icons/" + loginUser.icon} />
            <img src={"http://localhost:3001/api/uploads/" + loginUser.icon} alt="icon" />
            <img src={"http://localhost:3001/api/uploads/default.png"} alt="icon" />
            </div>
        <form onSubmit={handleSubmitIcon}>
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
    
            <button type="submit">送信</button>
            </form>

            {/* <p>AccessToken: {token}</p> */}
            
            {/* { user && 
                <p>user: {loginUser.userName}</p>
            } { !user && 
                <p>user: </p>
            } */}

            {/* <div>
            <label className={styles.switch}>
            <input
              type="checkbox"
              checked={twoFactorAuth}
              onChange={handle2FAToggle}
            />
            <span className={styles.slider}></span>
            </label>
            <span>{twoFactorAuth ? '2FA有効' : '2FA無効'}</span>
            </div> */}

        <div>
            <label className={styles.switch}>
            <input
              type="checkbox"
              checked={twoFactorAuth}
              onChange={enableTwoFactorAuth}

            />
            <span className={styles.slider}></span>
            </label>
            <span>{twoFactorAuth ? '2FA有効' : '2FA無効'}</span>
        </div>


      <Modal show={showModal} onClose={() => {
        setShowModal(false)
        setTwoFactorAuth(false)

        // 無効リクエストを送る
       }}>
        {/* 2FAフォームコンポーネント */}
        <form onSubmit={handleSubmit2Fa}>

        {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6桁のコード"
            maxLength={6}
          />
          <button type="submit">確認</button>
        </form>
      </Modal>

        </div>
    );
}
"use client"
import { useState, useEffect } from 'react';
//import axios from 'axios';
//import { useHistory, useLocation } from 'react-router-dom';
//import { useRouter } from 'next/router';
//import Router from 'next/router'
//import { redirect } from 'next/navigation'
//https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating
import { useRouter } from 'next/navigation'
import { jwtDecode } from "jwt-decode";
import { useAuth } from '@/providers/useAuth';

import { usePublicRoute } from '@/hooks/usePublicRoute';
import Modal from '../../components/users/2fa/modal'; // Modalコンポーネントをインポート


// SSRならできる。useEffectは使えなくなる
//import { cookies } from 'next/headers'
// export async function getSessionData(req) {
//     const encryptedSessionData = cookies().get('jwt')?.value
//     console.log("encryptedSessionData: ", encryptedSessionData)
//     return encryptedSessionData ? JSON.parse(jwtDecode(encryptedSessionData)) : null
// }


type User = {
    userId: number,
    userName: string,
    email: string,
    password: string,
    createdAt: Date,
};

// export default function Form() {
//     const [userName, setUserName] = useState('');
//     const [password, setPassword] = useState('');
//     //const [user, setUser] = useState(null);
//     const [token, setToken] = useState('');
//     const router = useRouter();

//     //const {signin} = useLoginUser();
//     const {signin, loginUser, getCurrentUser, loading} = useAuth();

//     console.log("signin")

//     // const isEmpty = (obj) => {
//     //     return Object.keys(obj).length === 0;
//     // }

//     useEffect(() => {
//         //if (token == '' || token === undefined) return;
//         getCurrentUser();
//     }, []);

//     useEffect(() => {
//         //if (loading) return;
//         //if (token == '' || token === undefined) return;
//         //console.log('user: ', user);

//         console.log("リダイレクト判定")
//         console.log("user: ", loginUser)
//         console.log("token: ", token)
//         // console.log(user === null)
//         // console.log((token !== '' && token !== undefined))
//         console.log(loginUser !== null || (token !== '' && token !== undefined))
//         if (loginUser !== null || (token !== '' && token !== undefined)) {
//             console.log("リダイレクト判定2")
//             if (token != '' && token !== undefined && loginUser) {
//                 // console.log('user: ', user);
//                 // console.log('token: ', token);
//                 const decode = jwtDecode(token);
//                 // console.log('decode: ', decode['twoFactorAuth']);
//                 // console.log(user.twoFactorAuth)
//                 // console.log("if: ", decode['twoFactorAuth'] === false && user.twoFactorAuth === true)
//                 if (decode['twoFactorAuth'] === false && loginUser.twoFactorAuth === true) {
//                     router.push('/users/2fa')
//                     return
//                 }
//             }

//             // ここはprivateRouteでやればいいかも
//             // if (loginUser !== null) {
//             //     console.log("リダイレクト判定3")
//             //     router.push('/');
//             // }
//         }
//     }, [loginUser, token])

//     //微妙な実装
//     //usePublicRoute();

//     // const getCurrentUser = () => {
//     //     fetch('http://localhost:3001/users/me', {
//     //         method: 'GET',
//     //         credentials: 'include',
//     //         // headers: {
//     //         //     "Authorization": `Bearer ${token}`
//     //         // }
//     //     })
//     //     .then((res) => {
//     //         //console.log(res.data);
//     //         return res.json();
//     //     })
//     //     .then((data) => {
//     //         console.log('Success:', data);
//     //         setUser(data.user);
//     //         //router.push('/');
//     //         //Router.push('/');
//     //         //redirect('/');
//     //     })
//     //     .catch((error) => {
//     //         console.error('Error:', error);
            
//     //         // redirect
//     //     });
//     // }

//     // mfnyuを参考にしてloginをさんこう　 if res.status == 200 でtokenをsetToken
//     const handleSubmit = (e) => {
//         e.preventDefault();
//         // ここでフォームのデータを処理します
//         // axios.post('localhost:3001/users/login', { username, email });
//         // fetch('http://localhost:3001/users/signin', {
//         //     method: 'POST',
//         //     credentials: 'include',
//         //     headers: {
//         //         'Content-Type': 'application/json',
//         //     },
//         //     body: JSON.stringify({ userName, password }),
//         // })
//         // .then ((res) => {
//         //     // /console.log(res.json());
//         //     return res.json();
//         // })
//         // //.then((res) => res.json())
//         // .then((data) => {
//         //     console.log('Success:', data.accessToken);
//         //     setToken(data.accessToken);
//         //     getCurrentUser();
//         // })
//         // .catch((error) => {
//         //     console.error('Error:', error);
//         // });

//         // console.log('送信されたデータ:', { userName, password });


//         signin( userName, password );
//         //getCurrentUser();
//         // 送信後の処理（例: フォームをクリアする）
//         setUserName('');
//         setPassword('');
//     };

//     // 読み込み中はローディングを表示
//     // 一瞬見れる問題を解決
//     if (loading || loginUser) {
//         return <p>loading...</p>
//     }
    
//     return (
//         <div>
//         <form onSubmit={handleSubmit}>
//             <label htmlFor="username">名前:</label>
//             <input
//             type="text"
//             id="userName"
//             value={userName}
//             onChange={(e) => setUserName(e.target.value)}
//             />
    
//             <label htmlFor="password">パスワード:</label>
//             <input
//             type="password"
//             id="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             />
    
//             <button type="submit">送信</button>

//             {/* <p>AccessToken: {token}</p> */}
            
//             { loginUser && 
//                 <p>user: {loginUser.userName}</p>
//             } { !loginUser && 
//                 <p>user: </p>
//             }

//         </form>

//         <button onClick={() => router.push('/auth/signup')}>signup</button>

//         <button>
//             <a href="http://localhost:3001/auth/callback/42">42ログイン</a>
//         </button>
//         </div>
//     );
// }

export default function Form() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const [validationUserId, setValidationUserId] = useState(0);
    const [show2Fa, setShow2Fa] = useState(false);
    const [code, setCode] = useState('');

    const router = useRouter();
    const {signin, loginUser, getCurrentUser, loading} = useAuth();

    // useEffect
    useEffect(() => {
        getCurrentUser();
    }, []);

    // signin関数をこっちに戻す
    // id, statusによって2faに飛ばすかどうかを判定

    // フォーム

    console.log(show2Fa)

    const handleSubmit = (e) => {
        e.preventDefault();
        // ここでフォームのデータを処理します
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
            if (data.status === "SUCCESS" && data.userId === undefined) {
                //console.log('Success:', data.accessToken);
                getCurrentUser();
                router.push('/');
            } else if (data.status === "2FA_REQUIRED" && data.userId !== undefined) {
                setValidationUserId(data.userId);
                setShow2Fa(true);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        console.log('送信されたデータ:', { userName, password });


        //signin( userName, password );
        //getCurrentUser();
        // 送信後の処理（例: フォームをクリアする）
        setUserName('');
        setPassword('');
    };

    const handleSubmit2fa = (e) => {
        e.preventDefault();
        // ここに2FAコードを検証するロジックを追加
        console.log('Submitted 2FA code:', code);
        console.log('validationUserId:', validationUserId);
  
        fetch('http://localhost:3001/auth/2fa/verify', {
          method: 'POST',
          credentials: 'include',
          headers: {
                'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: validationUserId, code: code }),
          })
          .then((res) => {
              //console.log(res.data);
              return res.json();
          })
          .then((data) => {
            if (data.accessToken !== undefined) {
                console.log('Success:', data.accessToken);
                //setToken(data.accessToken);
                //router.push('/');
                getCurrentUser();
            } else {
                // errorメッセージを表示


            }
          })
          .catch((error) => {
              console.error('Error:', error);
  
              // redirect
          });
      };

    // modal

    // 読み込み中はローディングを表示
    // 一瞬見れる問題を解決
    if (loading || loginUser) {
        return <p>loading...</p>
    }

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

            {/* <p>AccessToken: {token}</p> */}
            
            { loginUser && 
                <p>user: {loginUser.userName}</p>
            } { !loginUser && 
                <p>user: </p>
            }

        </form>

        <Modal show={show2Fa} onClose={() => {
            // 無効リクエストを送る
        }}>
            {/* 2FAフォームコンポーネント */}
            <form onSubmit={handleSubmit2fa}>

            {/* {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />} */}
            <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6桁のコード"
                maxLength="6"
            />
            <button type="submit">確認</button>
            </form>
        </Modal>

        <button onClick={() => router.push('/auth/signup')}>signup</button>

        <button>
            <a href="http://localhost:3001/auth/callback/42">42ログイン</a>
        </button>
        </div>
    )
}
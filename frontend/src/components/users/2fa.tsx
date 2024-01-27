
import React, { useState, useEffect } from 'react';
import Modal from './2fa/modal'; // Modalコンポーネントをインポート
// ... その他のインポート
import styles from  "./toggleSwitch.module.css"
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode';


const TwoFactor = () => {
    //const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [user, setUser] = useState({});
    const [token, setToken] = useState('');
    const [code, setCode] = useState('');
    //const [twoFactorAuth, setTwoFactorAuth] = useState(false);
    const router = useRouter()

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
            console.log('2FAページにリダイレクト')
            router.push('/users/2fa')
            return
        }
        console.log('ホームページにリダイレクト')
        router.push('/');
    })

    const handleSubmit = (e) => {
      e.preventDefault();
      // ここに2FAコードを検証するロジックを追加
      console.log('Submitted 2FA code:', code);

      fetch('http://localhost:3001/auth/2fa/verify/' + code, {
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
            console.log('Success:', data.accessToken);
            setToken(data.accessToken);
            //router.push('/');
            getCurrentUser();

        })
        .catch((error) => {
            console.error('Error:', error);

            // redirect
        });
    };
  
  //const [showModal, setShowModal] = useState(false);

//   // 2FA有効化時にモーダルを表示
//   const enableTwoFactorAuth = (e) => {
//     setTwoFactorAuth(e.target.checked);
//     if (e.target.checked) {
//         setShowModal(true);
//         // ここに2FA有効化のロジックを追加
//         // const response = await fetch('http://localhost:3001/auth/2fa/generate');
//         // const data = await response.json();
//         // setQrCodeUrl(data.qrCode);

//         fetch('http://localhost:3001/auth/2fa/generate', {
//             method: 'GET',
//             credentials: 'include',
//             // headers: {
//             //     "Authorization": `Bearer ${token}`
//             // }
//         })
//         .then((res) => {
//             //console.log(res.data);
//             return res.json();
//         })
//         .then((data) => {
//             console.log('Success:', data.qrCord);
//             setQrCodeUrl(data.qrCord);
//             setShowModal(false)
//             //console.log('QRコード:', qrCodeUrl);
//             //Router.push('/');
//         })
//         .catch((error) => {
//             console.error('Error:', error);

//             // redirect
//         });
//     } else {
//         // ここに2FA無効化のロジックを追加
//         // const response = await fetch('http://localhost:3001/auth/2fa/disable');
//         // const data = await response.json();
//         // console.log('2FA無効化:', data);
//         fetch('http://localhost:3001/auth/2fa/disable', {
//             method: 'GET',
//             credentials: 'include',
//             // headers: {
//             //     "Authorization": `Bearer ${token}`
//             // }
//         })
//         .then((res) => {
//             //console.log(res.data);
//             return res.json();
//         })
//         .then((data) => {
//             console.log('Success:', data);
//             //Router.push('/');
//         })
//         .catch((error) => {
//             console.error('Error:', error);

//             // redirect
//         });
//     }
//   };

  //常にモーダルを表示
  return (
    <div>
      <h1>2FA</h1>
      {/* <button onClick={enableTwoFactorAuth}>二段階認証を有効にする</button> */}

      <Modal show={true} onClose={() => {
        // 無効リクエストを送る
       }}>
        {/* 2FAフォームコンポーネント */}
        <form onSubmit={handleSubmit}>

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
    </div>
  );
};

export default TwoFactor;

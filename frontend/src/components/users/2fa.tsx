
import React, { useState } from 'react';
import Modal from './2fa/modal'; // Modalコンポーネントをインポート
// ... その他のインポート
import styles from  "./toggleSwitch.module.css"
import { useRouter } from 'next/navigation'

const TwoFactor = () => {
    //const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [code, setCode] = useState('');
    //const [twoFactorAuth, setTwoFactorAuth] = useState(false);
    const router = useRouter()

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
            //router.push('/');

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

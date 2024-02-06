/* eslint-disable */
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
import { useAuth } from '@/providers/useAuth';

import { usePublicRoute } from '@/hooks/routes/usePublicRoute';
import Modal from '../../components/users/2fa/modal'; // Modalコンポーネントをインポート

export default function Form() {
    // 2faが必要な場合のstate
    const [validationUserId, setValidationUserId] = useState(0);
    const [show2Fa, setShow2Fa] = useState(false);
    const [code, setCode] = useState('');

    const router = useRouter();
    const {signin, loginUser, getCurrentUser, loading} = useAuth();

    useEffect(() => {
        getCurrentUser();
    }, []);

    useEffect(() => {
        fetch('http://localhost:3001/auth/login42', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => {
            if (res.status === 200) {
                return res.json();
            }
        }).then((data) => {
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
    }, []);

    // 2faの実行ボタン関数
    // 認証後にgetCurrentUserを実行 
    // jwtがセットされているのでgetCurrentUserでユーザー情報を取得できる
    const handleSubmit2fa = (e: React.FormEvent<HTMLFormElement>) => {
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

    if (loading || loginUser) {
        return <p>loading...</p>
    }

    // モーダルなどセット
    return (
        <div>
            <h1>42ログイン中...</h1>

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
                    maxLength={6}
                />
                <button type="submit">確認</button>
                </form>
            </Modal>
        </div>
    )
    

}

"use client"
import React, { useState } from 'react';
import {signIn, signOut} from 'next-auth/react'
import { useRouter } from 'next/navigation'

export const LoginButton = () => {
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const router = useRouter();

    const handleSignIn = async (e) => {
        e.preventDefault();
        // userが帰ってくる？
        const result = await signIn('credentials', {
          redirect: false,
          username,
          password,
        });

        // sessionが設定される
        console.log("result: ", result)

    
        if (result.status === 200 && result.error === '2FA Code is required') {
          setShowTwoFactorModal(true);
        } else {
          // 通常のエラーハンドリング

          // リダイレクトなど？
          //router.push('/');
        }
      };
    
      const handleTwoFactorSubmit = async (e) => {
        e.preventDefault();
        const result = await signIn('credentials', {
          redirect: false,
          username,
          password,
          twoFactorCode,
        });

        console.log("result: ", result)
    
        // 2FA認証結果に基づく処理

        if (result.status === 200) {
          // リダイレクトなど
        }
      };
    return (
        <>
        {/* <div className="flex flex-col items-center justify-center mt-10">
            <div className="flex flex-row items-center justify-center">
                <div className="text-2xl font-bold">Credentials</div>

                <div className="flex flex-row items-center justify-center ml-10">
                    <div className="text-2xl font-bold">Login</div>
                    <div className="text-2xl font-bold">Form</div>
                </div>
            </div>
            <div className="flex flex-row items-center justify-center">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => signIn()}>
                    Sign In
                </button>
            </div>
        </div> */}


        <div>
            <form onSubmit={handleSignIn}>
                <input
                type="text"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="text"
                />
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                />
                <button type="submit">Sign In</button>
            </form>

            {showTwoFactorModal && (
                <div> {/* モーダルの実装 */}
                <form onSubmit={handleTwoFactorSubmit}>
                    <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="2FA Code"
                    />
                    <button type="submit">Verify</button>
                </form>
                </div>
            )}
            </div>
        </>
    )
}

export const LoginButton42 = () => {

    return (
        <>
        <div className="flex flex-col items-center justify-center">
            <div className="text-4xl font-bold">Welcome to Transcendence</div>
            <div className="text-2xl font-bold">Please Sign In</div>
        </div>

        <div className="flex flex-col items-center justify-center mt-10">
            <div className="flex flex-row items-center justify-center">
                <div className="text-2xl font-bold">42</div>
                <div className="text-2xl font-bold">Login</div>
            </div>
            <div className="flex flex-row items-center justify-center">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => signIn("42-school")}>
                    Sign In
                </button>
            </div>
        </div>
        </>
    )
}


export const LogoutButton = () => {
    return (
        <>
        <div className="flex flex-col items-center justify-center mt-10">
            <div className="flex flex-row items-center justify-center">
                <div className="text-2xl font-bold">Logout</div>
            </div>
            <div className="flex flex-row items-center justify-center">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => signOut()}>
                    Sign Out
                </button>
            </div>
        </div>
        </>
    )
}
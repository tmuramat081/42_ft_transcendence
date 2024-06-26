/* eslint-disable */
"use client"
import React, {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useState,
    useEffect
} from "react";

import {User} from "../types/user"

import { useSocketStore } from "@/store/game/clientSocket";
import { SocketAuth } from "@/types/game/game";

//import { usePrivateRoute } from '@/hooks/routes/usePrivateRouter'
//import { usePublicRoute } from "@/hooks/routes/usePublicRoute";

//import { useRouter } from 'next/navigation'

// API毎回呼び出すのは非効率なので、contextに保存しておく

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type LoginUserContextType = {
    loginUser: User | null;
    setLoginUser: Dispatch<SetStateAction<User | null>>;
    isLoggetIn: boolean;
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
    loading: boolean;
    signup: (userName: string, email: string, password: string, passwordConfirm: string) => Promise<void>;
    signin: (userName: string, password: string) => void;
    getCurrentUser: (() => Promise<User | null>);
};

const LoginUserContext = createContext<LoginUserContextType>({} as LoginUserContextType)

export const LoginUserProvider = (props: {children: ReactNode}) => {

    const { children } = props
    // 使わないかも
    const [loginUser, setLoginUser] = useState<User | null>(null)
    // 使わないかも
    const [isLoggetIn, setIsLoggedIn] = useState<boolean>(false)
    // 読み込み状態
    // 最初にアクセスした段階では読み込み中にする
    const [loading, setLoading] = useState<boolean>(true)

    const { socket } = useSocketStore();

    // 不要かも
    const signup = async (userName: string, email: string, password: string, passwordConfirm: string) => {
        // const {router} = useRouter();
        await fetch(`${API_URL}/users/signup`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName, email, password, passwordConfirm }),
        })
        .then ((res) => {
            // /console.log(res.json());
            if (res.status === 200) {
                return res.json();
            }
        })
        //.then((res) => res.json())
        .then((data) => {
            // userId, resultStatus, accessTokenを返すようにする
            console.log('Success:', data.accessToken);
            //setToken(data.accessToken);


            // resultStatusがSUCCESSならユーザー情報を取得
            //ユーザー情報を取得
            getCurrentUser();

            // signinにリダイレクト
            //router.push('/auth/signin');

        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    // 不要かも
    // const signin = async (userName: string, password: string) => {
    //     await fetch('http://localhost:3001/users/signin', {
    //         method: 'POST',
    //         credentials: 'include',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ userName, password }),
    //     })
    //     .then ((res) => {
    //         // /console.log(res.json());
    //         console.log(res.status);
    //         if (res.status === 201) {
    //             return res.json();
    //         }
    //     })
    //     //.then((res) => res.json())
    //     .then((data) => {
    //         // userId, resultStatus, accessTokenを返すようにする
    //         console.log('Success:', data.accessToken);
    //         //setToken(data.accessToken);

    //         // resultStatusがNEED2FAでuserIdがあれば2faページにリダイレクト


    //         // resultStatusがSUCCESSならユーザー情報を取得
    //         getCurrentUser();
    //     })
    //     .catch((error) => {
    //         console.error('Error:', error);
    //     });

    //     console.log('送信されたデータ:', { userName, password });
    // }

    // 不要かも
    const signin = async (userName: string, password: string) => {
        await fetch(`${API_URL}/users/signin`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName, password }),
        })
        .then ((res) => {
            // /console.log(res.json());
            console.log(res.status);
            if (res.status === 201) {
                return res.json();
            }
        })
        //.then((res) => res.json())
        .then((data) => {
            // userId, resultStatus, accessTokenを返すようにする
            console.log('Success:', data.userId, data.status)
            //setToken(data.accessToken);

            // resultStatusがNEED2FAでuserIdがあれば2faページにリダイレクト
            if (data.status === 'NEED2FA') {
                //router.push('/auth/2fa');

                // userIdをstateにセットするだけ？
                return;
            }
            
            // resultStatusがSUCCESSならユーザー情報を取得
            getCurrentUser();
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        console.log('送信されたデータ:', { userName, password });
    }

    // // user, loadingを更新する
    // const getCurrentUser = async (): Promise<User | null>  => {
    //     setLoading(true);
    //     const user = await fetch('http://localhost:3001/users/me', {
    //         method: 'GET',
    //         credentials: 'include',
    //         // headers: {
    //         //     "Authorization": `Bearer ${token}`
    //         // }
    //     })
    //     .then((res) => {
    //         //console.log(res.data);
    //         if (res.status === 200) {
    //             return res.json();
    //         }
    //     })
    //     .then((data) => {
    //         console.log('Success:', data);
    //         if (data !== undefined) {
    //             setLoginUser(data.user);
    //             setLoading(false);
    //             return data.user;
    //         } else { 
    //             // if (failCallback !== undefined) {
    //             //     failCallback();
    //             // }
    //             setLoading(false);
    //             return null;
    //         }
    //         //router.push('/');
    //         // if (user !== undefined) {
    //         //     router.push('/');
    //         // }
    //     })
    //     .catch((error) => {
    //         console.error('Error:', error);
    //         // if (failCallback !== undefined) {
    //         //     failCallback();
    //         // }
    //         setLoading(false);
    //         return null;
    //         // redirect
    //     });
    //     setLoading(false);
    //     return user;
    // }
    
    const getCurrentUser = async (): Promise<User | null>  => {
        // if (loginUser)
        //     return loginUser;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/users/me`, {
                method: 'GET',
                credentials: 'include',
            });
    
            if (response.status === 200) {
                const data = await response.json();
                console.log('Success:', data);
                setLoginUser(data.user);

                // socketにuserIdをセット   
                const socketAuth = { userId: data.user.userId } as SocketAuth;
                console.log('socketAuth:', socketAuth);
                socket.auth = socketAuth;
                socket.connect();
                
                return data.user;
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
        return null;
    }

    // useEffect(() => {
    //     getCurrentUser();
    // })

    return (
        <LoginUserContext.Provider value={{ 
            loginUser, 
            setLoginUser, 
            isLoggetIn, 
            setIsLoggedIn,
            loading, 
            signup,
            signin,
            getCurrentUser,
        }}>
            {children}
        </LoginUserContext.Provider>
    )
}

export const useAuth = (): LoginUserContextType => useContext(LoginUserContext);
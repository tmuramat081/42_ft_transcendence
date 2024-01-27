"use client"
import React, {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useState
} from "react";

import {User} from "../types/user"

import { usePrivateRoute } from '@/hooks/usePrivateRouter'
import { usePublicRoute } from "@/hooks/usePublicRoute";



type LoginUserContextType = {
    loginUser: User;
    setLoginUser: Dispatch<SetStateAction<User>>;
    isLoggetIn: boolean;
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
    loading: boolean;
    signup: () => void;
    signin: (userName: string, password: string) => void;
    getCurrentUser: (() => void);
    twoFactorAuth: (code: string) => void;
};

const LoginUserContext = createContext<LoginUserContextType>({} as LoginUserContextType)

export const LoginUserProvider = (props: {children: ReactNode}) => {

    const { children } = props
    const [loginUser, setLoginUser] = useState<User | null>(null)
    const [isLoggetIn, setIsLoggedIn] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)

    // 一個ずつ実装していく
    const signup = async (userName: string, email: string, password: string, passwordConfirm: string) => {
        await fetch('http://localhost:3001/users/signup', {
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
            console.log('Success:', data.accessToken);
            //setToken(data.accessToken);
            getCurrentUser();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    const signin = async (userName: string, password: string) => {
        await fetch('http://localhost:3001/users/signin', {
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
            console.log('Success:', data.accessToken);
            //setToken(data.accessToken);
            getCurrentUser();
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        console.log('送信されたデータ:', { userName, password });
    }

    const getCurrentUser = async () => {
        setLoading(true);
        await fetch('http://localhost:3001/users/me', {
            method: 'GET',
            credentials: 'include',
            // headers: {
            //     "Authorization": `Bearer ${token}`
            // }
        })
        .then((res) => {
            //console.log(res.data);
            if (res.status === 200) {
                return res.json();
            }
        })
        .then((data) => {
            console.log('Success:', data);
            if (data !== undefined) {
                setLoginUser(data.user);
                setLoading(false);
                return data.user;
            } else { 
                // if (failCallback !== undefined) {
                //     failCallback();
                // }
                setLoading(false);
                return null;
            }
            //router.push('/');
            // if (user !== undefined) {
            //     router.push('/');
            // }
        })
        .catch((error) => {
            console.error('Error:', error);
            // if (failCallback !== undefined) {
            //     failCallback();
            // }
            setLoading(false);
            return null;
            // redirect
        });
        setLoading(false);
    }

    const twoFactorAuth = async (code: string) => {
        await fetch('http://localhost:3001/auth/2fa/verify/' + code, {
            method: 'POST',
            credentials: 'include',
            // headers: {
            //     "Authorization": `Bearer ${token}`
            // }
            })
            .then((res) => {
                //console.log(res.data);
                if (res.status === 200) {
                    return res.json();
                }
            })
            .then((data) => {
                console.log('Success:', data.accessToken);
                //setToken(data.accessToken);
                //router.push('/');
                getCurrentUser();

            })
            .catch((error) => {
                console.error('Error:', error);

                // redirect
            });
    }

    const logout = () => {

    }

    const verify2FA = (code: string, callback: () => {}) => {

    }

    const enable2FA = (code: string, callback: () => {}) => {
    }

    const disable2FA = (code: string, callback: () => {}) => {

    }

    // usePrivateRoute();
    // usePublicRoute();

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
            twoFactorAuth
        }}>
            {children}
        </LoginUserContext.Provider>
    )
}

export const useAuth = (): LoginUserContextType => useContext(LoginUserContext);
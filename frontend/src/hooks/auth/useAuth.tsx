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
import { useRouter } from 'next/navigation';

export const getCurrentUser = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('http://localhost:3001/users/me', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (res.status === 200) {
                    const data = await res.json();
                    console.log('Success:', data);
                    if (data !== undefined) {
                        setUser(data.user);
                    } else {
                        router.push('/');
                    }
                } else {
                    throw new Error('Failed to fetch user');
                }
            } catch (error) {
                console.error('Error:', error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    return { loading, user };
};

// 一個ずつ実装していく
export const signup = async (userName: string, email: string, password: string, passwordConfirm: string) => {
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
        //getCurrentUser();

        //cookieに保存される
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

export const signin = async (userName: string, password: string) => {
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
        //getCurrentUser();

        //cookieに保存される
    })
    .catch((error) => {
        console.error('Error:', error);
    });

    console.log('送信されたデータ:', { userName, password });
}
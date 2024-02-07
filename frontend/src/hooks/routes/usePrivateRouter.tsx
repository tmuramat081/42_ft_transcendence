/* eslint-disable */
"use client";
import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/useAuth'

//使っていない

// ユーザーの認証状態をチェックし、認証されていなければリダイレクトするカスタムフック
export const usePrivateRoute = () => {
    const router = useRouter();
    const { loginUser, getCurrentUser, loading } = useAuth();
    const pathname = usePathname();
    //const [loading, setLoading] = useState(true);

    // const redirectFunc = async () => {
    //   const user = await getCurrentUser();
    //   if (user == null) {
        
    //   }

    // }

    useEffect(() => {
      console.log("loading: ", loading)
      if (loading) return;
      // const user = getCurrentUser();
      // console.log("private route: " , user)
      // 特定のページでのみ認証チェックを行う
      const privateRoutes = [
        '/users/update', 
      ];

      console.log("private route: " , loginUser) 
      // ユーザー認証状態をチェックするロジック
  
      //if (protectedRoutes.includes(pathname) && user == null) {
      if (privateRoutes.includes(pathname) && !loginUser) {
        // ユーザーが認証されていなければ、/loginにリダイレクト
        //router.push('/auth/signin');
        router.replace('/auth/signin');

      }
    }, [loginUser, loading]);
  }
  
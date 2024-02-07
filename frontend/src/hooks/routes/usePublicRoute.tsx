/* eslint-disable */
"use client";
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/providers/useAuth'

//使っていない

// ユーザーの認証状態をチェックし、認証されていなければリダイレクトするカスタムフック
export const usePublicRoute = () => {
    const router = useRouter();
    const { loginUser, getCurrentUser, loading } = useAuth();
    const pathname = usePathname();


  
    useEffect(() => {
        console.log("loading: ", loading)
        if (loading) return;
      //console.log(pathname)

    //   const user = getCurrentUser();
    //   console.log("public route: " , user)

      // 特定のページでのみ認証チェックを行う
      const publicRoutes = [
        '/auth/signin',
        '/auth/signin-oauth',
        '/auth/signup', 
        '/auth/2fa', 
      ];

      // ユーザー認証状態をチェックするロジック  
      //if (protectedRoutes.includes(pathname) && user != null) {
      if (publicRoutes.includes(pathname) && loginUser) {
        // ユーザーが認証されていなければ、/loginにリダイレクト
        //router.push('/');
        router.replace('/');
      }
    }, [loginUser, loading]);
  }
  
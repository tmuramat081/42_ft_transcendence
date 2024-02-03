"use client";
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/providers/useAuth'

// ユーザーの認証状態をチェックし、認証されていなければリダイレクトするカスタムフック
export const useRouterGuard = () => {
    const router = useRouter();
    const { loginUser, getCurrentUser, loading } = useAuth();
    const pathname = usePathname();


    const privateRoutes = [
        '/users/update', 
    ];

    const publicRoutes = [
        '/auth/signin',
        '/auth/signin-oauth',
        '/auth/signup', 
    ];

  
    useEffect(() => {
      //console.log("loading: ", loading)
      if (loading) return;

      console.log("useRouterGuard: ", loginUser)

      // ユーザー認証状態をチェックするロジック  
      //if (protectedRoutes.includes(pathname) && user != null) {
      if (publicRoutes.includes(pathname) && loginUser) {
        // ユーザーが認証されていなければ、/loginにリダイレクト
        //router.push('/');
        router.replace('/');
      }

      if (privateRoutes.includes(pathname) && !loginUser) {
        // ユーザーが認証されていなければ、/loginにリダイレクト
        //router.push('/auth/signin');
        router.replace('/auth/signin');
      }
    }, [loginUser, loading, pathname]);
  }
  
/* eslint-disable */
"use client";
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/providers/useAuth'
import { APP_ROUTING } from '@/constants/routing.constant';

// ユーザーの認証状態をチェックし、認証されていなければリダイレクトするカスタムフック
export const useRouterGuard = () => {
    const router = useRouter();
    const { loginUser, loading } = useAuth();
    const pathname = usePathname();


    const privateRoutes = [
        '/users/update', 
        '/dashboard'
    ];

    const publicRoutes = [
        '/auth/signin',
        '/auth/signin-oauth',
        '/auth/signup', 
    ];

  
    useEffect(() => {
    //   if (!loginUser) {
    //     getCurrentUser();
    //   }
      //console.log("loading: ", loading)
      if (loading) return;

      // ユーザー認証状態をチェックするロジック  
      if (publicRoutes.includes(pathname) && loginUser) {
        // ユーザーが認証されていれば、/dashboardにリダイレクト
        console.log("useRouterGuard: dashboard", loginUser)
        router.push(APP_ROUTING.DASHBOARD.path);
      }

      if (privateRoutes.includes(pathname) && !loginUser) {
        // ユーザーが認証されていなければ、/loginにリダイレクト
        console.log("useRouterGuard: login", loginUser)
        router.push(APP_ROUTING.AUTH.SIGN_IN.path);
      }
    }, [loginUser, loading, pathname]);
  }
  
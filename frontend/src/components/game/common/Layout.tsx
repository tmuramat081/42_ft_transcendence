/* eslint-disable */
'use client';
//
import { GameGuest } from '@/components/game/common/GameGuest';
import { useAuth } from '@/providers/useAuth';
import Head from 'next/head';
import { useRouter, usePathname } from 'next/navigation';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
//
import { useSocketStore } from '@/store/game/clientSocket';
import { Friend } from '@/types/game/friend';
import { SocketAuth } from '@/types/game/game';
import { Loading } from './Loading';

type Props = {
  title: string;
  children: ReactNode;
};

// レイアウト
// 全てのページに共通するレイアウト
// GlobalHeaderに移植

export const Layout: FC<Props> = ({ title = "PingPong", children }) => {
  //const router = useRouter();
  const { socket } = useSocketStore();
  const [ hosts, setHosts ] = useState<Friend[]>([]);
  const { loginUser, getCurrentUser } = useAuth();
  const showGuestPath = useMemo(() => [
    'game/index', 'game/battle'], []);
  const pathname = usePathname();

  useEffect(() => {
    getCurrentUser();
  }, []);
  
  useEffect(() => {
    // ソケット通信をするかどうか判定
    // アンマウント時にソケット通信の処理を解除するため
    let ignore = false;
    // console.log('login')
    // console.log(loginUser)

    if (!loginUser) return ;

    // 切断時に再接続
    if (socket.disconnected) {
      const socketAuth = {
        userId: loginUser.userId,
      } as SocketAuth;
      socket.auth = socketAuth;
      socket.connect();
    }

    // ゲームページに遷移した時にホスト一覧を取得
    if (showGuestPath.includes(pathname)) {
      socket.emit('getInvitedList', {userId: loginUser.userId}, (res: Friend[]) => {
        if (!ignore) {
          console.log(res);
          setHosts(res);
        }
      });
    }
    return () => {
      ignore = true;
    }
    //router.pathname?
  }, [loginUser, pathname, socket, showGuestPath]);

  useEffect(() => {
    if (!showGuestPath.includes(pathname)) return ;

    // 招待を受け取る
    socket.on('inviteFriend', (data: Friend) => {
      // 既に招待されている場合は削除してから追加
      setHosts(...hosts.filter((host) => host.userId !== data.userId), data);
    });

    // 招待をキャンセル
    socket.on('cancelInvitation', (data: Friend) => {
      setHosts(hosts.filter((host) => host.userId !== data.userId));
    });

    return () => {
      socket.off('inviteFriend');
      socket.off('cancelInvitation');
    }
  }, [])

  // あとでLoadingコンポーネントを作成
  if (pathname === '/' && !loginUser) {
    return <Loading />
  }

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      {hosts.length > 0 && <GameGuest hosts={hosts} setHosts={setHosts} />}
      <main>{ children }</main>
    </div>
  )
}

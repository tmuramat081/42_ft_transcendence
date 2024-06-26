/* eslint-disable */
'use client';
import styles from './page.module.css';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter} from 'next/navigation';
import { Loading } from '@/components/game/common/Loading';

/**
 * TOPページ
 * [TODO] 画面設計後に実装する
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/auth/signin');
  }, []);

  return (
    <>
      {/* <h1>TOPページ</h1> */}
      {/* CSSモジュールを読み込み */}
      {/* <main className={styles.main}>
        <ul>
          <li> */}
            {/* ルーティング */}
            {/* <Link href="./game/rooms/list">ゲーム</Link>
          </li> */}
          {/* chatページを追加 */}
          {/* <li>
            <Link href="./chat">チャット</Link>
          </li>
          <li>
            <Link href="./auth/signup">サインアップ</Link>
          </li>
          <li>
            <Link href="./auth/signin">サインイン</Link>
          </li>
          <li>
            <Link href="./users/update">ユーザー情報更新</Link>
          </li>
          <li>
            <Link href="./users/index">
              ユーザー一覧
            </Link>
          </li>
        </ul>
      </main> */}
      <Loading />
    </>
  );
}

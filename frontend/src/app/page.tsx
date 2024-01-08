"use client"
import styles from './page.module.css'

import Link from 'next/link'
/**
 * TOPページ
 * [TODO] 画面設計後に実装する
 */
export default function Home() {
  return (
    <>
      <h1>TOPページ</h1>
      {/* CSSモジュールを読み込み */}
      <main className={styles.main}>
        <ul>
          <li>
          {/* ルーティング */}
          <Link href="./game/demonstration">
            ゲーム デモンストレーション
          </Link>
          </li>
          <li>
            <Link href="./auth/signup">
              サインアップ
            </Link>
          </li>
          <li>
            <Link href="./auth/signin">
              サインイン
            </Link>
          </li>
        </ul>
      </main>
    </>
  )
}

"use client";
import styles from "./page.module.css";

import Link from "next/link";
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
            <Link href="./game/demonstration">ゲーム デモンストレーション</Link>
          </li>
          {/* chatページを追加 */}
          <li>
            <Link href="./chat">チャット</Link>
          </li>
        </ul>
      </main>
    </>
  );
  );
}

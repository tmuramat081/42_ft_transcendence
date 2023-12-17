"use client"
import PongDemo from '@/components/game/PongDemo'

/**
 * Pageはルート固有のUIです。page.jsファイルからコンポーネントをエクスポートすることでページを定義できます。
 * ネストされたフォルダを使ってルートとpage.jsファイルを定義し、ルートを一般公開します。
 * 
 * https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts
 */
export default function Page() {
  return (
	<PongDemo
	  title={'Pong! demo'}
	  width={1200}
	  height={800}
	/>
  )
}
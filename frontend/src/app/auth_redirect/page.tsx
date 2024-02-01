"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Authorization() {
    const { data: session } = useSession();
    console.log("session: ", session)

    useEffect(() => {
        if (!session) {
            //
            return 
        }  
        
        // session があれば、signIn する
        // cookieを付与する [jwt]を付与する これがバックエンドとのアクセストークンになる
        // sessionのmail address で42かどうかを判断する

        // 42の場合
        // signin42を呼び出す

        // 42でない場合
        // signinを呼び出す
        // passwordなど必要なので、signinコンポーネントでやった方がいい

        // 2段階認証が必要であれば、モーダルを表示する
        // userIdとstatusを返すようにコントローラーを改良する
        // 2faのコントローラーじゃjwtは不要にする
        // 2fa完了後に/にリダイレクトする
    }, [session]);
    return (
        <div>
            <h1>Authorization</h1>
        </div>
    )
}
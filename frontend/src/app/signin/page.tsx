import {
    LoginButton, 
    LogoutButton,
    LoginButton42
} from "./buttons"

import {getServerSession} from "next-auth/next"
import {options} from "../options"
import { signIn, signOut } from "next-auth/react"

export default async function Home() {
    const session = await getServerSession(options)
    const user = session?.user

    // ログイン42とcredentialsのログインボタン作成　フォームも追加
    //2faはモーダルで表示
    return (
        // <main 
        //     style={{
        //         display: "flex",
        //         alignItems: "center",
        //         justifyContent: "center",
        //         height: "100vh",
        //     }}
        // >
        //     <div>
        //         <div>{`${JSON.stringify(user)}`}</div>
        //         <div>{`${JSON.stringify(session)}`}</div>
        //         {user ? <div>Logged in</div> : <div>Not logged in</div>}
        //         {user ? <LogoutButton /> : <LoginButton />}
        //         <LoginButton42 />
        //     </div>
        // </main>

        <>
            <div className="flex flex-col items-center justify-center h-screen">
                <LoginButton42 />
                <LoginButton />
                <LogoutButton />
            </div>
        </>
    );
}
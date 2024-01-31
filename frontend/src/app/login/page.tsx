import {
    LoginButton, 
    LogoutButton,
    LoginButton42
} from "../../components/buttons"

import {getServerSession} from "next-auth/next"
import {options} from "../options"

export default async function Home() {
    const session = await getServerSession(options)
    const user = session?.user
    if (session)
        session.user.foo = "bar"

    const session2 = await getServerSession(options)
    console.log("session: ", session2)

    console.log("user: ", user)

    return (
        <main 
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
            }}
        >
            <div>
                <div>{`${JSON.stringify(user)}`}</div>
                <div>{`${JSON.stringify(session)}`}</div>
                {user ? <div>Logged in</div> : <div>Not logged in</div>}
                {user ? <LogoutButton /> : <LoginButton />}
                <LoginButton42 />
            </div>
        </main>
    );
}
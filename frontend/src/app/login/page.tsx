import {
    LoginButton, 
    LogoutButton
} from "../../components/buttons"

import {getServerSession} from "next-auth/next"
import {options} from "../options"

export default async function Home() {
    const session = await getServerSession(options)
    const user = session?.user

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
                {user ? <div>Logged in</div> : <div>Not logged in</div>}
                {user ? <LogoutButton /> : <LoginButton />}
            </div>
        </main>
    );
}
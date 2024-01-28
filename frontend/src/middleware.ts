import { withAuth } from "next-auth/middleware";
//export { default } from "next-auth/middleware"; // defaultをママ使う。

// 逆にパブリックなページを作る場合は、
// useSession()を使う。でユーザーがいれば、リダイレクトさせる
export const config = {
    matcher: ["/((?!api|login).*)"], // ?!で否定です。
};

export default withAuth(
    function middleware(req) {
        console.log("in middleware: ", req.nextauth.token)
    },
    {
        callbacks: {
            authorized: ({token}) => {
                console.log("in authorized: ", token)
                return token !== null
            },
        },
    }
)
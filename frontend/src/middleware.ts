import { withAuth } from "next-auth/middleware";
//export { default } from "next-auth/middleware"; // defaultをママ使う。
import {NextResponse, NextRequest} from 'next/server';
import NextAuth from "next-auth";
import {options} from "./app/options";

//const auth = NextAuth(options)

// export default auth((req) => {
//     const { nextUrl } = req;
//     const isLoggedIn = !!req.auth

//     return req.auth.token !== null && req.auth.token.twoFactorAuth === req.auth.token.twoFactorAuthNow;

// })

// 逆にパブリックなページを作る場合は、
// useSession()を使う。でユーザーがいれば、リダイレクトさせる
export const config = {
    matcher: ["/((?!api|login|signin|users/update).*)"], // ?!で否定です。
};

export default withAuth(
    function middleware(req) {
        console.log("in middleware: ", req.nextauth)
        console.log("in middleware: ", req.nextauth.token)
    },
    {
        callbacks: {
            authorized: ({token}) => {

                console.log("in authorized: ", token)

                // return NextResponse.redirect(
                //     //new URL(`/${token.name}`, request.url)
                //     new URL("/login", "http://localhost:3000")
                // );

                // トークンが存在して、2faも有効かされていれば、trueを返す
                return token !== null && token.twoFactorAuth === token.twoFactorAuthNow;
            },

        },
    }
)

// // 2faが有効な場合は、2faのページにリダイレクトさせる
// export async function middleware(req: NextRequest) {
//     console.log("in middleware2222: ", req)
//     if (req.nextauth?.token?.twoFactorAuth !== req.nextauth?.token?.twoFactorAuthNow) {
//         return NextResponse.redirect(
//             //new URL(`/${token.name}`, request.url)
//             new URL("/", "http://localhost:3000")
//         );
//     }
// }
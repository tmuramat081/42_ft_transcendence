import type {NextAuthOptions} from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import FortyTwoProvider from 'next-auth/providers/42-school'
//import * as bcrypt from 'bcrypt'

export const options: NextAuthOptions = {
    debug: true,
    // JWTの設定
    session: { strategy: 'jwt' },
    providers: [
        FortyTwoProvider({
            clientId: process.env.UID42,
            clientSecret: process.env.SECRET42,
        }),
        CredentialsProvider({
            // The name to display on the sign in form (e.g. 'Sign in with...')
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text", placeholder: "test" },
                password: { label: "Password", type: "password" },
                twoFactorCode: { label: "2FA Code", type: "text", placeholder: "000000" },
            }, 

            // フォーム入力後の処理
            async authorize(credentials) {
                // api signin
                // nameとpasswordからuserを検索
                const user = await fetch('http://backend:3000/auth/signin', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userName: credentials.username, password: credentials.password }),
                }).then((res) => {
                    console.log(res)

                    if (res.ok) {
                        return res.json()
                    }
                    return null
                }).then((data) => {
                    console.log(data.user)
                    if (data.user) {
                        return data.user
                    }
                    return null
                }).catch((error) => {
                    console.log(error)
                    return null
                });

                // twoFactorAuthがtrueの場合は2段階認証
                // フォームに入力された2faコードを使って、apiにアクセス
                // verify2fa
                if (user && user.twoFactorAuth) {
                    // １回目はfaコードがないので、エラーを返し、再送させる
                    if (!credentials.twoFactorCode) {
                        return new Error('2FA Code is required');
                    }

                    if (!user.twoFactorAuthSecret) {
                        return new Error('2FA Secret is required');
                    }

                    const verified = await fetch('http://backend:3000/auth/verify2fa', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ twoFactorCode: credentials.twoFactorCode }),
                    }).then((res) => {
                        console.log(res)

                        if (res.ok) {
                            return res.json()
                        }
                        return null
                    }
                    ).then((data) => {
                        console.log(data)
                        if (data.verified) {
                            return data.verified
                        }
                        return null
                    }
                    ).catch((error) => {
                        console.log(error)
                        return null
                    }
                    );

                    console.log("in authorize2", verified)
                    if (!verified) {
                        return new Error('2FA Code is invalid');
                    }
                }

                
                // ここ変更
                //const user = {"username": credentials.username, "password": credentials.password}

                console.log("in authorize", {credentials, user})
                //return {"name": user.userName, "email": user.email, "image": user.icon};
                return user;
            }
        })
    ],
    callbacks: {
        // signin時の処理
        signIn: async (user, account, profile) => {
            console.log("in signIn", {user, account, profile})
            return true
        },
        // 認証成功時の処理
        jwt: async ({token, user, account, profile, isNewUser}) => {
            // signinしてjwtを取得
            console.log("in jwt", {token, user, account, profile, isNewUser})


            // OAUTHの場合はaccountが存在する
            if (account?.provider === '42-school') {
                console.log("in 42")

                console.log(profile.email, profile.login, profile.image.link)

                //
                //const salt = await bcrypt.genSalt();
                const user2 = await fetch(`http://backend:3000/auth/signin42`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: profile.email,
                        //password: bcrypt.hash(profile.login, salt),
                        password: "42OAUTH!" + profile.login,
                        userName: profile.login,
                        name42: profile.login,
                        icon: profile.image.link,
                    }),
                }).then((res) => {
                    if (res.ok) {
                        return res.json()
                    }
                    return null
                }).then((data) => {
                    console.log(data)
                    if (data.user) {
                        return data.user
                    }
                    return null
                }).catch((error) => {
                    console.log(error)
                    return null
                });

                console.log("in jwt2", user2)

                // tokenにはname, email, imageが入るが、userNameのままだと変換されないので、nameに変更
                token.name = user2.userName;
                // 追加情報
                token.twoFactorAuth = user2.twoFactorAuth;
                token.twoFactorAuthNow = false;

                //token.user = user2;

                // if (user2) {
                //     token.user = user2;
                // }
                token.accessToken = account.accessToken;
            // ログインの場合はuserが存在する
            } else if (user) {
                console.log("???:", user)

                //
                const user2 = await fetch(`http://backend:3000/auth/signin`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userName: user.userName, password: user.password }),
                }).then((res) => {
                    if (res.ok) {
                        return res.json()
                    }
                    return null
                }).then((data) => {
                    console.log(data)
                    if (data.user) {
                        return data.user
                    }
                    return null
                }).catch((error) => {
                    console.log(error)
                    return null
                });

                console.log("in jwt2", user2)

                // tokenにはname, email, imageが入るが、userNameのままだと変換されないので、nameに変更
                token.name = user2.userName;
                token.email = user2.email;
                token.image = user2.icon;
                // 追加情報
                token.twoFactorAuth = user2.twoFactorAuth;
                token.twoFactorAuthNow = false;
                //token.user = user2;
            }

                // if (user) {
                //     //token.user = {"name": user.userName, "email": user.email, "image": user.icon};
                //     token.user = user2;
                // }
                // if (user) {
                //     token.user = user;
                // }
            return token;
        },
        // jwtにuser情報を追加
        //useSession()で取得できる
        session: ({session, token}) => {
            console.log("in session", {session, token})
            return {
                ...session,
                user: {
                    // name, email, imageはjwtで取得できる
                    ...session.user,
                    //user: token.user,
                    // 追加情報
                    twoFactorAuth: token.twoFactorAuth,
                    twoFactorAuthNow: token.twoFactorAuthNow,
                },
                // user2: {
                //     ...token.user,
                // }
            }
        }
    }, 

    // カスタムページ
    // pages: {
    //     signIn: '/signin',
    // }
};
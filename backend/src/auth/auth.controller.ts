import { Controller, Get, Post, Res, Req, Param,  UseGuards, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express'
import { AuthService } from './auth.service';
import { IntraAuthGuard } from './guards/auth.guards';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../users/interfaces/jwt_payload';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';

// mfnyu 15, 16


@Controller('auth')
export class AuthController {
    constructor(
		private httpService: HttpService,
		private jwtService: JwtService,
        private authService: AuthService,
	) {}


    // passportを使う場合
    // 以下のURLにアクセスすると、認証画面に飛ぶ。
    // その後、設定したリダイレクト先に飛び、認証コードを受け取る。
    // この認証コードを使って、アクセストークンを取得する。
    // アクセストークンを使って、ユーザー情報を取得する。
    //https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-326bb2dea9d537b9d377e8d7f2ae37131be5fc8644c00cc79e59ac87e74e0f3c&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fauth%2Fcallback%2F42&response_type=code
    // アクセストークンを返す 16を参考
    @Get('/callback/42')
    @UseGuards(IntraAuthGuard)
    async callback42(@Res({ passthrough: true }) res: Response, @Req() req) {
        // userを受け取って、jwtを返す
        // strategyでuserを受け取る

        console.log(req.user)
        const userName = req.user['username']
		const userId = req.user['userId']
        const email = req.user['email']
		const payload: JwtPayload = { userId: userId, userName: userName, email: email };
		//console.log(payload)
		const accessToken: string = await this.jwtService.sign(payload)
		res.cookie('jwt', accessToken, { httpOnly: true })
        res.redirect(process.env.FRONTEND_URL)
    }

    // passportを使わない場合
    // @Get('/callback/42')
    // async callback42_2(@Res({ passthrough: true }) res: Response, @Req() req) {
    //     // 認証コードを受け取って、アクセストークンを取得する
    //     const code = req.query.code;

    //     const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             grant_type: 'authorization_code',
    //             client_id: process.env.INTRA_CLIENT_ID,
    //             client_secret: process.env.INTRA_CLIENT_SECRET,
    //             code: code,
    //             redirect_uri: process.env.INTRA_REDIRECT_URI,
    //         }),
    //     });

    //     const tokenData = await tokenResponse.json();

    //     // user情報を取得する
    //     const userResponse = await fetch('https://api.intra.42.fr/v2/me', {
    //         method: 'GET',
    //         headers: {
    //             Authorization: `Bearer ${tokenData.access_token}`,
    //         },
    //     });


    //     const { email, login, image } = await userResponse.json();

    //     // ユーザーが存在するか確認する
    //     const user = await this.authService.validateUser({
    //         email: email,
    //         password: login,
    //         userName: login,
    //         name42: login,
    //         icon: image,
    //     });

    //     const payload: JwtPayload = { userId: user.userId, userName: user.userName, email: user.email };
    //     const accessToken: string = await this.jwtService.sign(payload);
    //     res.cookie('jwt', accessToken, { httpOnly: true })

    //     console.log("accessToken: " + accessToken);
    //     res.redirect(process.env.FRONTEND_URL)
    // }

    // 2faの設定
    // @Post("/2fa")
    // @UseGuards(JwtAuthGuard)
    // async update2fa(@Req() req) {
    //     const user = req.user
    //     const secret = await this.authService.update2fa(user)
    //     return secret
    // }

    // // 2faが正しいかを検証
    // @Post("/2fa/verify")
    // @UseGuards(JwtAuthGuard)
    // async verify2fa(@Req() req: Request) {
    //     const user = req.user
    //     const secret = await this.authService.verify2fa(user)
    //     return secret
    // }

    //@Param() code: string
    @UseGuards(JwtAuthGuard)
    @Post("/2fa/verify/:code")
    async verify2fa(@Req() req, @Res({ passthrough: true }) res: Response) {
        const user = req.user
        const code = req.params.code
        const verified = await this.authService.verify2fa(user, code)
        if (!verified) {
            throw new UnauthorizedException("Invalid code")
        }

        const payload: JwtPayload = { userId: user.userId, userName: user.userName, email: user.email };
        const accessToken: string = this.jwtService.sign(payload);
        res.cookie('jwt', accessToken, { httpOnly: true })
        return JSON.stringify({"accessToken": accessToken});
    }

    // // qrcodeを出力
    // secret keyだけ保存して
    // verifyしたら、二段階認証を有効にする
    // 資料確認
    @UseGuards(JwtAuthGuard)
    @Get("/2fa/generate")
    async get2faCode(@Req() req) {
        const user = req.user

        console.log("generate")
        // const code = await this.authService.get2faCode(user)
        const code = await this.authService.generate2faAuthSecret(user)
        const qrcode = await this.authService.generate2faQrCode(code)
        //const img: string = "<img src=" + qrcode + ">"
        //return img

        return JSON.stringify({"qrCord": qrcode})
    }
}

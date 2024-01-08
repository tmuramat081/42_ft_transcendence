import { Controller, Get, Res, Req, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express'
import { AuthService } from './auth.service';
import { IntraAuthGuard } from './guards/auth.guards';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../users/interfaces/jwt_payload';

// mfnyu 15, 16


@Controller('auth')
export class AuthController {
    constructor(
		private httpService: HttpService,
		private jwtService: JwtService,
        private authService: AuthService,
	) {}


    // passportを使う場合
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
}

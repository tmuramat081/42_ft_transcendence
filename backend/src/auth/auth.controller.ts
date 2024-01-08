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
}

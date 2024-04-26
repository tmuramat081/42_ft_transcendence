/* eslint-disable */
import {
  Controller,
  Get,
  Post,
  Res,
  Req,
  Body,
  Param,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { IntraAuthGuard } from './guards/42auth.guards';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../users/interfaces/jwt_payload';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { UserDto42 } from 'src/users/dto/user42.dto';
import { Validate2FACodeDto } from './dto/2fa';
//import { jwtDecode } from "jwt-decode";
import { UsersService } from '../users/users.service';

// mfnyu 15, 16

@Controller('auth')
export class AuthController {
  constructor(
    //private httpService: HttpService,
    private jwtService: JwtService,
    private authService: AuthService,
    private usersService: UsersService,
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
    const jwtPayload = {
      userId: req.user.userId, 
      userName: req.user.userName, 
      email: req.user.email, 
      icon: req.user.icon
    };
    const accessToken: string = await this.jwtService.sign(jwtPayload);
    res.cookie('login42', accessToken, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.redirect(process.env.FRONTEND_URL + '/auth/signin-oauth');
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
;
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

  @Get('/login42')
  async login42(@Req() req, @Res({ passthrough: true }) res: Response) {
      const accessToken = req?.cookies['login42'];

      // アクセストークンがない場合

      // アクセストークンを解析
      const payload = this.jwtService.decode(accessToken);

      const userData: UserDto42 = {
        email: payload.email,
        password: payload.userName,
        userName: payload.userName,
        name42: payload.userName,
        icon: payload.icon,
      }; 

    // ユーザーを検証
    //   const user = await this.authService.validateUser(userData);

    // if (!user) {
    //     throw new UnauthorizedException('Invalid credentials');
    // }

    try {
      const user = await this.authService.validateUser(userData);
          // 2faの検証
      if (user.twoFactorAuth) {
        return {userId: user.userId, status: '2FA_REQUIRED'};
      }

      // const payload2: JwtPayload = { userId: user.userId, userName: user.userName, email: user.email, twoFactorAuth: false };
      // const accessToken2: string = this.jwtService.sign(payload2);
      const accessToken2 = await this.usersService.generateJwt(user);

      res.cookie('jwt', accessToken2, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });

      // cookie削除
      res.clearCookie('login42');

      this.usersService.loginUserIds.push(user.userId);

      return {userId: undefined, status: 'SUCCESS'};
    } catch (error) {
      throw error;
    }
  }

  // idからuserを取得するようにする
  //@Param() code: string
  //@UseGuards(JwtAuthGuard)
  @Post('/2fa/verify')
  async verify2fa(
    @Body() dto: Validate2FACodeDto,
    @Req() req,
    @Res({ passthrough: true }) res: Response
  ) {
      // const user = req.user
    // const code = req.params.code
    // const verified = await this.authService.verify2fa(user, code)
    // if (!verified) {
    //     throw new UnauthorizedException("Invalid code")
      // }

    // const payload: JwtPayload = { userId: user.userId, userName: user.userName, email: user.email, twoFactorAuth: true };
      // const accessToken: string = this.jwtService.sign(payload);
    // res.cookie('jwt', accessToken, { httpOnly: true })
    // return JSON.stringify({"accessToken": accessToken});

    try {
      console.log('verify');
      console.log(dto);

      const user = await this.usersService.findOne(dto.userId);

      console.log(user);

      // dtowを渡すように変更する？ userを渡すようにする？
      const verified = await this.authService.verify2fa(dto.userId, dto.code);
      if (!verified) {
          throw new UnauthorizedException('Invalid code');
      }

      console.log('verified');

      // const payload: JwtPayload = { userId: user.userId, userName: user.userName, email: user.email, twoFactorAuth: true };
      // const accessToken: string = this.jwtService.sign(payload);
      const accessToken = await this.usersService.generateJwt(user);

      res.cookie('jwt', accessToken, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });

      return JSON.stringify({'accessToken': accessToken});
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/2fa/disable')
  async disable2fa(@Req() req, @Res({ passthrough: true } ) _res: Response) {
      const user = req.user;
      await this.authService.disable2fa(user);
      return JSON.stringify({'message': '2fa disabled'});
  }

  // // qrcodeを出力
  // secret keyだけ保存して
  // verifyしたら、二段階認証を有効にする
  // 資料確認
  @UseGuards(JwtAuthGuard)
  @Get('/2fa/generate')
  async get2faCode(@Req() req) {
      const user = req.user;

      const code = await this.authService.generate2faAuthSecret(user);
      const qrcode = await this.authService.generate2faQrCode(code);

      return JSON.stringify({'qrCord': qrcode });
  }
}

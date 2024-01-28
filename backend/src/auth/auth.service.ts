import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDto42 } from '../users/dto/user42.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt'
//import { JwtPayload } from './interfaces/jwt_payload';

import * as QRCode from 'qrcode';
import * as speakeasy from 'speakeasy';
import { SignInUserDto } from 'src/users/dto/user.dto';

// mfnyu 15, 16

@Injectable()
export class AuthService {
    constructor (private usersService: UsersService) {}

    async validateUser(user: UserDto42): Promise<User> {
        //return await this.usersService.findOneById(id);
        //return await this.usersService.findOneByName42(username);
        return await this.usersService.validateUser42(user);
    }

    async signIn(userData: SignInUserDto): Promise<User> {
        const user = await this.usersService.signInReturnUser(userData);
        return user;
    }

    // // JWT
    // async update2fa(user: User, updateUserData: UserDto42): Promise<User> {
    //     var updateUser: User = new User();
    //     updateUser.userName = user.userName;
    //     updateUser.email = user.email;
    //     updateUser.password = user.password;
    //     return await this.usersService.updateUser(user.userName, );
    // }

    async verify2fa(user: User, code: string): Promise<boolean> {
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorAuthSecret,
            encoding: 'base32',
            token: code,
        })

        // first time
        // update2fa
        if (verified && !user.twoFactorAuth) {
            user.twoFactorAuth = true
            await this.usersService.updateUser2fa(user.userName, true);
        }
        return verified;
    }

    async generate2faAuthSecret(user: User) : Promise<string> {
        //speakeasyとは、2段階認証を行う際のハッシュ値の生成や認証コードが一致するかのチェックなどの手間となる部分をよしなにやってくれるモジュールです。
        //example: FBDXWRCNIBFUA5JKGNKF2SBRGVYUOKJQ
        //const secret = speakeasy.generateSecret({});
        const secret = speakeasy.generateSecret({length: 20});

        //QRコードの画像生成
        // QRCode.toDataURL(secret.otpauth_url, (err, qrcode) => {
        //     console.log(qrcode); // base64のQRコードの画像パスが入ってきます
        // });
        const otpAuthUrl = speakeasy.otpauthURL({
            secret: secret.base32,
            encoding: 'base32',
            label: user.userName,
            issuer: 'ft_transcendence',
        })

        // ユーザーの更新
        user.twoFactorAuthSecret = secret.base32;
        // update2fascret
        await this.usersService.updateUser2faSecret(user.userName, secret.base32);

        return otpAuthUrl; 
    }

    // user情報からQRコードを生成
    async generate2faQrCode(otpAuthUrl: string): Promise<string> {
        return QRCode.toDataURL(otpAuthUrl)
    }

    async disable2fa(user: User): Promise<User> {
        user.twoFactorAuth = false
        await this.usersService.updateUser2fa(user.userName, false);
        return user
    }
}

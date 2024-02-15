/* eslint-disable */
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, Profile } from 'passport-42';
import { AuthService } from '../auth.service';
import { UserDto42 } from 'src/users/dto/user42.dto';
import { User } from '../../users/entities/user.entity';

// 11スクラッチ 15  mfnyu
// 両方バージョンで実装してみる
@Injectable()
export class IntraStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.UID,
      clientSecret: process.env.SECRET,
      callbackURL: process.env.API_REDIRECT_URL,
      scope: ['public'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<User> {
    const { username, emails, photos } = profile;
    //avatar_url: photos[0].value,]
    //email: profile['emails'][0]['value'],

    // const user: User = await this.authService.validateUser(id, username, emails[0].value)
    // const payload = {
    //     id: user.userId,
    //     username: user.userName,
    //     email: user.email,
    // }
    // const jwt: string = await this.authService.login(payload)
    // const data = {
    //     jwt: jwt,
    //     user: user,
    // }

    const user: UserDto42 = {
      email: emails[0].value,
      password: username,
      userName: username,
      name42: username,
      icon: photos[0].value,
    };

    console.log('IntraStrategy validate');

    return this.authService.validateUser(user);

    // Promise<any>を返す
    //done(null, user)
  }
}

/* eslint-disable */
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, Profile } from 'passport-42';
import { AuthService } from '../auth.service';
import { UserDto42 } from 'src/users/dto/user42.dto';
import { User } from '../../users/entities/user.entity';

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
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    _done: (err: any, user: any, info?: any) => void,
  ): Promise<User> {
    const { username, emails, photos } = profile;
  
    const user: UserDto42 = {
      email: emails[0].value,
      password: username,
      userName: username,
      name42: username,
      icon: photos[0].value,
    };

    return this.authService.validateUser(user);
  }
}

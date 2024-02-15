/* eslint-disable */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../users/entities/user.entity';
import { UserRepository } from '../../users/users.repository';
import { Request } from 'express';
import { JwtPayload } from '../../users/interfaces/jwt_payload';

// 認証処理を実装
@Injectable()
// PassportStrategyを継承
// jwtのStrategyをを引数に渡す
export class TwoFactorAuthStrategy extends PassportStrategy(Strategy, '2fa') {
  // UserRepositoryをインジェクション
  constructor(private userRepository: UserRepository) {
    // jwtの設定
    // 親クラスのコンストラクタに渡す 親クラス=PassportStrategy
    super({
      // cookieからJWTを取得
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const accessToken = request?.cookies['jwt'];
          return accessToken;
        },
      ]),

      //Authorization: Bearer <token> からJWTを取得
      //jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 有効期限の検証を行う
      ignoreExpiration: false,
      // JWTの署名に使う秘密鍵
      secretOrKey: 'secretKey123',
    });
  }

  // 認証処理
  // validateはPassportStrategyに定義されているメソッド
  async validate(payload: JwtPayload): Promise<User> {
    // ペイロードからユーザーIDとユーザー名を取得 自動で検証される
    const { userName, twoFactorAuth } = payload;

    console.log('payload: ', payload);
    console.log('userName: ', userName);
    console.log('twoFactorAuth: ', twoFactorAuth);

    // ユーザーの検索
    const user = await this.userRepository.findOneByName(userName);

    //console.log("user: ", user)

    // 2faが違う場合はエラー
    if (user.twoFactorAuth && twoFactorAuth != user.twoFactorAuth) {
      console.log('twoFactorAuth: ', twoFactorAuth);
      console.log('twoFactorAuth: ', user.twoFactorAuth);
      throw new UnauthorizedException();
    }

    if (user) {
      console.log('user: ', user);
      return user;
    }
    // ユーザーが見つからない場合はエラー
    // 例外は大域脱出する
    throw new UnauthorizedException();
  }
}

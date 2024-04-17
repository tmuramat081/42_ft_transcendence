/* eslint-disable */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { UserRepository } from '../users.repository';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt_payload';

// 認証処理を実装
@Injectable()
// PassportStrategyを継承
// jwtのStrategyをを引数に渡す
export class JwtStrategy extends PassportStrategy(Strategy) {
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
    const { userName } = payload;
    // ユーザーの検索
    const user = await this.userRepository.findOneByName(userName);
    if (user) {
      return user;
    }
    // ユーザーが見つからない場合はエラー
    // 例外は大域脱出する
    throw new UnauthorizedException();
  }
}

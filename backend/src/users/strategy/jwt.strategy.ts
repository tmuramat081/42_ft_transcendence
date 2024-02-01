import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { UserRepository } from '../users.repository';
import { Request } from 'express'
import { JwtPayload, JwtPayload2 } from '../interfaces/jwt_payload';
import { JwtService } from '@nestjs/jwt'
import { decode } from "next-auth/jwt"

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
            const accessToken = request?.cookies['jwt']
            console.log("accessToken: ", accessToken)
            return accessToken

            // const jwtService: JwtService = new JwtService({ secret: process.env.NEXTAUTH_SECRET });

            // const accessToken = request?.cookies['next-auth.session-token']

            // const secret = process.env.NEXTAUTH_SECRET
            // const token = accessToken

            // const decoded = await decode({ token, secret })

            // console.log("decoded: ", decoded)

            // //console.log(decoded.name)

            // const payload = {
            //   userId: 0,
            //   userName: decoded.name,
            //   email: decoded.email,
            //   twoFactorAuth: decoded.twoFactorAuth,
            // }

            // const t = await jwtService.sign(payload)
            // console.log("t: ", t)

            // const {name, email, image} = decoded
            // console.log("name: ", name)
            // return t
        },
      ]),

    //Authorization: Bearer <token> からJWTを取得
      //jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 有効期限の検証を行う
      ignoreExpiration: false,
      // JWTの署名に使う秘密鍵
      //secretOrKey: 'secretKey123',
      secretOrKey: process.env.NEXTAUTH_SECRET,
    });
  }

  // 認証処理
  // validateはPassportStrategyに定義されているメソッド
  async validate(payload: JwtPayload): Promise<User> {
    // // ペイロードからユーザーIDとユーザー名を取得 自動で検証される
    // const { userName } = payload;

    // console.log("payload: ", payload)
    // console.log("userName: ", userName)

    // // ユーザーの検索
    // const user = await this.userRepository.findOneByName( userName );

    // //console.log("user: ", user)

    // if (user) {
    //   console.log("user: ", user)
    //   console.log("userが見つかりました")
    //   return user;
    // }
    // // ユーザーが見つからない場合はエラー
    // // 例外は大域脱出する
    // throw new UnauthorizedException();

    console.log("payload: ", payload)

    //const {name, email, image} = payload;
    const {userName} = payload;

    console.log("payload: ", payload)

    // ユーザーの検索
    const user = await this.userRepository.findOneByName( userName );

    //console.log("user: ", user)

    if (user) {
      console.log("user: ", user)
      console.log("userが見つかりました")
      return user;
    }
    // ユーザーが見つからない場合はエラー
    // 例外は大域脱出する
    throw new UnauthorizedException();
  }
}
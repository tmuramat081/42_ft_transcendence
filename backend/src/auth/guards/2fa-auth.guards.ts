import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// 14, mfny参考
// jwtから2faが必要なのか、そしてされているのかを判断する

@Injectable()
export class TwoFactorAuthGuard extends AuthGuard('2fa') {
  // 認証に失敗した場合はnullを返す
  // いる？
  // handleRequest(err: any, user: any, info: any) {
  //     if (err || !user) {
  //         return null;
  //     }
  //     return user;
  // }
}

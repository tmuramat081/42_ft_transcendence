import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    // 認証に失敗した場合はnullを返す
    // いる？
    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            return null;
        }
        return user;
    }
}
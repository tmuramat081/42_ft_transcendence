import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { Response } from 'express';

/*
分離のポイント
コントローラはビジネスロジックを持たない: コントローラはリクエストとレスポンスの処理に集中し、ビジネスロジックはサービスに任せます。
サービスはデータアクセスロジックを持たない: サービスはビジネスルールに集中し、データの永続化や検索はリポジトリに任せます。
リポジトリはビジネスロジックを持たない: リポジトリはデータアクセスの詳細に集中し、ビジネスルールやアプリケーションロジックから独立しています。


Controller
HTTPリクエストのハンドリング: コントローラは、クライアントからの HTTP リクエストを受け取り、適切なレスポンスを返す責任があります。
リクエストの検証: リクエストデータの初期検証を行い、適切なサービスメソッドにデータを渡します。
レスポンスの整形: サービスからのデータをクライアントに返す形式に整形します。
エラーハンドリング: HTTP リクエストの処理中に発生するエラーを捕捉し、適切な HTTP ステータスコードとエラーメッセージで応答します。
*/
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('')
    findAll() {
        return this.usersService.findAll();
    }

    // ここ
    // paththrouth: true は、レスポンスを返すときに、レスポンスヘッダーを変更するために必要
    @Post('')
    SignUp(@Body () userData: UserDto, @Res({ passthrough: true }) res: Response) {
        // リクエストハンドリング

        // リクエストの検証

        // レスポンスの整形
        var user: User = new User();
        user.userName = userData.userName;
        user.email = userData.email;
        user.password = userData.password;

        // JWTを返す？
        return this.usersService.createUser(user);
    }
}

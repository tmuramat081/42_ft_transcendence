import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { Response, Request } from 'express';
import * as bcrypt from 'bcrypt'
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

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
    // curl -X POST -H "Content-Type: application/json" -d '{"userName":"test","email":"test@test","password":"test","passwordConfirm":"test"}' http://localhost:3001/users/signup
    // paththrouth: true は、レスポンスを返すときに、レスポンスヘッダーを変更するために必要
    //: Promise<User>
    @Post('/signup')
    SignUp(@Body () userData: UserDto, @Res({ passthrough: true }) res: Response) : Promise<string> | Response {
        // リクエストハンドリング
        if (!userData.userName || !userData.email || !userData.password) {
            //return res.status(400).json({ message: 'Please enter all fields' });
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        // リクエストの検証
        if (userData.password !== userData.passwordConfirm) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (bcrypt.compare(userData.password, userData.passwordConfirm) === false) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // アクセストークンを作成
        const accessToken: Promise<string> = this.usersService.signUp(userData);

        //cookieにアクセストークンを保存
        res.cookie('jwt', accessToken, { httpOnly: true })

        //redisにアクセストークンを保存

        return accessToken;
    }

    // curl -X POST -H "Content-Type: application/json" -d '{"userName":"test","password":"test"}' http://localhost:3001/users/signin
    //redisに保存されているアクセストークンを削除
    @Post('/signin')
    SignIn(@Body () userData: UserDto, @Res({ passthrough: true }) res: Response) : Promise<string> | Response {
        //アクセストークンを返す
        if (!userData.userName || !userData.password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        const accessToken: Promise<string> = this.usersService.signIn(userData);

        //cookieにアクセストークンを保存
        res.cookie('jwt', accessToken, { httpOnly: true })

        //redisにアクセストークンを保存

        return accessToken;
    }

    // curl -X GET -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJOYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEB0ZXN0IiwiaWF0IjoxNzAzNjg5NDUyLCJleHAiOjE3MDM2OTMwNTJ9.sI9qtCGhs1Azc7zKyXQkqRmkIYlC8Axb-6Lkz3N1GYw" http://localhost:3001/users/me
    // JWTからユーザーを取得する　API
    @UseGuards(JwtAuthGuard)
    @Get('/me')
    currentUser(@Req() req) : Partial<User>{
        const { password, ...user } = req.user;
        return user;
    }
}

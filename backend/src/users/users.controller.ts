import { Controller, Get, Post, Body, Req, Res, InternalServerErrorException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
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
    async SignUp(@Body () userData: UserDto, @Res({ passthrough: true }) res: Response) : Promise<string> {
        // リクエストハンドリング
        if (!userData.userName || !userData.email || !userData.password) {
            throw new ForbiddenException("Please enter all fields");
            //return res.status(400).json({ message: 'Please enter all fields' });
        }

        // リクエストの検証
        if (userData.password !== userData.passwordConfirm) {
            throw new ForbiddenException("Passwords do not match");
            //return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (bcrypt.compare(userData.password, userData.passwordConfirm) === false) {
            throw new ForbiddenException("Passwords do not match");
            //return res.status(400).json({ message: 'Passwords do not match' });
        }

        // アクセストークンを作成
        try {
            // saveは例外を投げる為、try-catchで囲む
            const accessToken: string = await this.usersService.signUp(userData);

            //cookieにアクセストークンを保存
            res.cookie('jwt', accessToken, { httpOnly: true })

            // //redisにアクセストークンを保存

            //return accessToken;
            return JSON.stringify({"accessToken": accessToken});
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new InternalServerErrorException('User already exists');
                //return res.status(400).json({ message: 'User already exists' });
            }
            throw new InternalServerErrorException("access token error");
            //return res.status(400).json({ message: 'User already exists' });
        }
    }

    // curl -X POST -H "Content-Type: application/json" -d '{"userName":"test","password":"test"}' http://localhost:3001/users/signin
    //redisに保存されているアクセストークンを削除
    @Post('/signin')
    async SignIn(@Body () userData: UserDto, @Res({ passthrough: true }) res: Response) : Promise<string> {
        //アクセストークンを返す
        //console.log(userData)
        if (!userData.userName || !userData.password) {
            //return res.status(400).json({ message: 'Please enter all fields' });
            throw new ForbiddenException("Please enter all fields");
        }

        // try {
        //     const accessToken: Promise<string> = this.usersService.signIn(userData);
        //     if (accessToken === null) {
        //         console.log("Invalid credentials");
        //         //throw new ForbiddenException("Invalid credentials");
        //         return res.status(400).json({ message: 'Invalid credentials' });
        //     }
        //     //cookieにアクセストークンを保存
        //     res.cookie('jwt', accessToken, { httpOnly: true })

        //     console.log("accessToken: " + accessToken);

        //     //redisにアクセストークンを保存

        //     return accessToken;
        // } catch (error) {
        //     console.log(error);
        //     //throw new UnauthorizedException("Invalid credentials");
        //     //throw new InternalServerErrorException("access token error");
        //     return res.status(400).json({ message: 'User already exists' });
        // }
        
        // findは例外を投げない為、try-catchで囲まない
        const accessToken: string = await this.usersService.signIn(userData);
        if (accessToken === null) {
            //console.log("Invalid credentials");
            throw new ForbiddenException("Invalid credentials");
            //return res.status(400).json({ message: 'Invalid credentials' });
        }
        //cookieにアクセストークンを保存
        res.cookie('jwt', accessToken, { httpOnly: true })

        //console.log("accessToken: " + accessToken);

        //redisにアクセストークンを保存

        return JSON.stringify({"accessToken": accessToken});
    }

    // curl -X GET -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJOYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEB0ZXN0IiwiaWF0IjoxNzAzNzU5NjU5LCJleHAiOjE3MDM3NjMyNTl9.R1TfxoDLp5kTOAAfIEGrkplZquRACJltQv3oGEANKDU" http://localhost:3001/users/me
    // JWTからユーザーを取得する　API
    @UseGuards(JwtAuthGuard)
    @Get('/me')
    currentUser(@Req() req) : string {
        //throw new ForbiddenException("Invalid credentials");
        const { password, ...user } = req.user;
        //const user = req.user;
        return JSON.stringify({"user": user});
    }

    @Get('/all')
    findAllUsers() {
        return this.usersService.findAll();
    }
}

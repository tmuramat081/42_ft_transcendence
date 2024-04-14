/* eslint-disable */
import { Controller, Get, Post, Put, Body, Req, Res, Param, InternalServerErrorException, ForbiddenException, UnauthorizedException, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { SignUpUserDto, SignInUserDto, UpdateUserDto, ReturnUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { Response, Request } from 'express';
import * as bcrypt from 'bcrypt'
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TwoFactorAuthGuard } from 'src/auth/guards/2fa-auth.guards';
import { AuthGuard } from '@nestjs/passport';
//Excludeを使うと、指定したプロパティを除外した型を作成できる
import { classToPlain } from "class-transformer";
//import { jwt_decode } from 'jwt-decode';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable, of } from 'rxjs'
import * as fs from 'fs';

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

// 例外処理をサービスで発生させてcatchする方がいいかも

// どれかの値
type ValidMimeTypes = 'image/png' | 'image/jpg' | 'image/jpeg' | 'image/gif';

// 有効なMIMEタイプの配列
const validMimeTypes: ValidMimeTypes[] = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif']; 

// Iconの保存先
const storage = {
    storage: diskStorage({
      // ファイルの保存先
      destination: (req, file, cb) => {
        const uploadPath: string = process.env.AVATAR_IMAGE_DIR;
        // 保存先が存在しない場合は作成
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      // ファイル名の設定
      filename: (req, file, cb) => {
        // ファイル名は拡張子のみ保持して、ファイル名自体はuuidに置換
        //const filename: string = uuidv4();
        // name.replace(/\s/g, '')  は、ファイル名にスペースが含まれている場合に、スペースを削除する
        const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
        const extension: string = path.parse(file.originalname).ext;
        // cbはコールバックの頭文字っぽい。第一引数はエラー、第二引数はファイル名を設定
        cb(null, `${filename}${extension}`);
      },
    }),

    // ファイルフィルター
    // MIMEタイプが許可されているかどうかを確認する
    fileFilter: (req, file, cb) => {
        const allowedMimeType = validMimeTypes.includes(file.mimetype);
        if (allowedMimeType) {
            // 15の例外
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    }, 

    // ファイルサイズの制限
    limits: {
        fileSize: 1024 * 1024 * 5
    },
  };


@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // users: User[] = [];にならない?なぜ？キャッシュのせい？
    @Get('/')
    async findAll(): Promise<string> {
        //return this.usersService.findAll();

        console.log("findAll")  
        const users: User[] = await this.usersService.findAll();
        console.log(JSON.stringify(users))
        return JSON.stringify({"users": users});
    }

    // @Get('/testaaaa')
    // async test(): Promise<string> {
    //     //return this.usersService.findAll();
    //     console.log("test")
    //     return JSON.stringify({"test": "test"});
    // }

    // ここ
    // curl -X POST -H "Content-Type: application/json" -d '{"userName":"test","email":"test@test","password":"test","passwordConfirm":"test"}' http://localhost:3001/users/signup
    // paththrouth: true は、レスポンスを返すときに、レスポンスヘッダーを変更するために必要
    //: Promise<User>
    // @Post('/signup')
    // async SignUp(@Body () userData: SignUpUserDto, @Res({ passthrough: true }) res: Response) : Promise<string> {
    //     // リクエストハンドリング
    //     if (!userData.userName || !userData.email || !userData.password) {
    //         throw new ForbiddenException("Please enter all fields");
    //         //return res.status(400).json({ message: 'Please enter all fields' });
    //     }

    //     // リクエストの検証
    //     if (userData.password !== userData.passwordConfirm) {
    //         throw new ForbiddenException("Passwords do not match");
    //         //return res.status(400).json({ message: 'Passwords do not match' });
    //     }

    //     if (bcrypt.compare(userData.password, userData.passwordConfirm) === false) {
    //         throw new ForbiddenException("Passwords do not match");
    //         //return res.status(400).json({ message: 'Passwords do not match' });
    //     }

    //     // アクセストークンを作成
    //     try {
    //         // saveは例外を投げる為、try-catchで囲む
    //         const accessToken: string = await this.usersService.signUp(userData);

    //         //cookieにアクセストークンを保存
    //         // localstrageよりcookieの方が安全
    //         // XSS, 有効期限の観点からもcookieの方が良い
    //         res.cookie('jwt', accessToken, { httpOnly: true })

    //         // //redisにアクセストークンを保存

    //         //return accessToken;
    //         return JSON.stringify({"accessToken": accessToken});
    //     } catch (error) {
    //         if (error.code === 'ER_DUP_ENTRY') {
    //             throw new InternalServerErrorException('User already exists');
    //             //return res.status(400).json({ message: 'User already exists' });
    //         }
    //         throw new InternalServerErrorException("access token error");
    //         //return res.status(400).json({ message: 'User already exists' });
    //     }
    // }

    @Post('/signup')
    async SignUp(@Body () userData: SignUpUserDto, @Res({ passthrough: true }) res: Response) : Promise<string> {
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

        //console.log("userData: ", userData)

        // アクセストークンを作成
        try {
            // saveは例外を投げる為、try-catchで囲む
            const user: User = await this.usersService.signUp(userData);

            // console.log("user: ", user);
            // console.log("userData: ", userData);

            // signupの中でやっている
            // if (await bcrypt.compare(userData.password, user.password) === false) {
            //     throw new ForbiddenException("Passwords do not match");
            //     //return res.status(400).json({ message: 'Passwords do not match' });
            // }

            //console.log("user: ", user);

            const accessToken: string = await this.usersService.generateJwt(user);
            
            //cookieにアクセストークンを保存
            // localstrageよりcookieの方が安全
            // XSS, 有効期限の観点からもcookieの方が良い
            res.cookie('jwt', accessToken, { httpOnly: true })

            // //redisにアクセストークンを保存

            //return accessToken;
            return JSON.stringify({"accessToken": accessToken});
        } catch (error) {
            // 例外を振り分ける方法
            // if (error instanceof InternalServerErrorException) {
            //     throw new InternalServerErrorException('User already exists');
            // }

            // 重複エントリーの例外を投げる
            // if ((error as any).code === 'ER_DUP_ENTRY') {
            //     throw new InternalServerErrorException('User already exists');
            //     //return res.status(400).json({ message: 'User already exists' });
            // }
            // throw new InternalServerErrorException("access token error");
            //return res.status(400).json({ message: 'User already exists' });

            throw error;
        }
    }

    // curl -X POST -H "Content-Type: application/json" -d '{"userName":"test","password":"test"}' http://localhost:3001/users/signin
    //redisに保存されているアクセストークンを削除
    // @Post('/signin')
    // async SignIn(@Body () userData: SignInUserDto, @Res({ passthrough: true }) res: Response) : Promise<string> {
    //     //アクセストークンを返す
    //     //console.log(userData)
    //     if (!userData.userName || !userData.password) {
    //         //return res.status(400).json({ message: 'Please enter all fields' });
    //         throw new ForbiddenException("Please enter all fields");
    //     }

    //     // try {
    //     //     const accessToken: Promise<string> = this.usersService.signIn(userData);
    //     //     if (accessToken === null) {
    //     //         console.log("Invalid credentials");
    //     //         //throw new ForbiddenException("Invalid credentials");
    //     //         return res.status(400).json({ message: 'Invalid credentials' });
    //     //     }
    //     //     //cookieにアクセストークンを保存
    //     //     res.cookie('jwt', accessToken, { httpOnly: true })

    //     //     console.log("accessToken: " + accessToken);

    //     //     //redisにアクセストークンを保存

    //     //     return accessToken;
    //     // } catch (error) {
    //     //     console.log(error);
    //     //     //throw new UnauthorizedException("Invalid credentials");
    //     //     //throw new InternalServerErrorException("access token error");
    //     //     return res.status(400).json({ message: 'User already exists' });
    //     // }
        
    //     // findは例外を投げない為、try-catchで囲まない
    //     const accessToken: string = await this.usersService.signIn(userData);

    //     // 2faの判定 signInをuserを返す様に修正する
    //     // accessTokenからtwoFactorAuthを取得する
    //     // const decode = jwt_decode(accessToken)
	// 	// if (decode['auth'] === false && user.twoFactorAuth === true) {
	// 	// 	throw new ForbiddenException('need 2FA')
	// 	// }
        

    //     if (accessToken === null) {
    //         //console.log("Invalid credentials");
    //         throw new ForbiddenException("Invalid credentials");
    //         //return res.status(400).json({ message: 'Invalid credentials' });
    //     }
    //     //cookieにアクセストークンを保存
    //     res.cookie('jwt', accessToken, { httpOnly: true })

    //     //console.log("accessToken: " + accessToken);

    //     //redisにアクセストークンを保存

    //     return JSON.stringify({"accessToken": accessToken});
    // }

    @Post('/signin')
    async SignIn(@Body () userData: SignInUserDto, @Res({ passthrough: true }) res: Response) : Promise<string> {
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

        try {
            // findは例外を投げない為、try-catchで囲まない
            const user: User = await this.usersService.signIn(userData);

            // 2faの判定 signInをuserを返す様に修正する
            // accessTokenからtwoFactorAuthを取得する
            // const decode = jwt_decode(accessToken)
            // if (decode['auth'] === false && user.twoFactorAuth === true) {
            // 	throw new ForbiddenException('need 2FA')
            // }

            // 2faの検証
            if (user.twoFactorAuth) {
                return JSON.stringify({"userId": user.userId, "status": "2FA_REQUIRED"});
            }

            const accessToken: string = await this.usersService.generateJwt(user);
            

            if (accessToken === null) {
                //console.log("Invalid credentials");
                throw new ForbiddenException("Invalid credentials");
                //return res.status(400).json({ message: 'Invalid credentials' });
            }
            //cookieにアクセストークンを保存
            res.cookie('jwt', accessToken, { httpOnly: true })

            //console.log("accessToken: " + accessToken);

            //redisにアクセストークンを保存

            //return JSON.stringify({"accessToken": accessToken});
            return JSON.stringify({"userId": undefined, "status": "SUCCESS"});
        } catch (error) {
            // if (error instanceof UnauthorizedException) {
            //     throw error;
            // }
            // throw new InternalServerErrorException();
            throw error;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/signout')
    async SignOut(@Req() req, @Res({ passthrough: true }) res: Response) : Promise<string> {
        //cookieからアクセストークンを削除
        res.clearCookie('jwt');

        return JSON.stringify({"status": "SUCCESS"});
    }

    // 未完成
    //@Param('username') userName: string, 引数に追加する
    // curl -X POST -H "Content-Type: application/json" -d '{"userName":"test","email":"test@example.com","password":"Test123!","passwordConfirm":"Test123!"}' http://localhost:3001/users/test/update
    //@UseGuards(AuthGuard('jwt'), JwtAuthGuard)
    @UseGuards(JwtAuthGuard)
    //@UseGuards(JwtAuthGuard, TwoFactorAuthGuard)
    @Post('/update')
    async UpdateUser(@Body () userData: UpdateUserDto, @Req() req,  @Res({ passthrough: true }) res: Response) {
        // // リクエストハンドリング
        // if (!userData.userName || !userData.email) {
        //     throw new ForbiddenException("Please enter all fields");
        //     //return res.status(400).json({ message: 'Please enter all fields' });
        // }

        // // パスワードの変更をした場合
        // // リクエストの検証
        // if (userData.password !== userData.passwordConfirm) {
        //     throw new ForbiddenException("Passwords do not match");
        //     //return res.status(400).json({ message: 'Passwords do not match' });
        // }

        // // アクセストークンを更新
        // // idにした方がいい
        // // var accessToken: string = await this.usersService.updateUser(req.user.userName, userData);
        // // if (accessToken === null) {
        // //     //console.log("Invalid credentials");
        // //     throw new ForbiddenException("Invalid credentials");
        // //     //return res.status(400).json({ message: 'Invalid credentials' });
        // // }

        // // update
        // const user: User = await this.usersService.updateUser(req.user.userId, userData);
        // if (user === null) {
        //     throw new ForbiddenException("Invalid credentials");
        //     //return res.status(400).json({ message: 'Invalid credentials' });
        // }

        // // passwordの確認
        // // 入力データと更新後のデータを比較
        // // if (await bcrypt.compare(userData.password, user.password) === false) {
        // //     throw new ForbiddenException("Passwords do not match");
        // //     //return res.status(400).json({ message: 'Passwords do not match' });
        // // }

        // const accessToken: string = await this.usersService.generateJwt(user);
        
        // if (accessToken === null) {
        //     //console.log("Invalid credentials");
        //     throw new ForbiddenException("Invalid credentials");
        //     //return res.status(400).json({ message: 'Invalid credentials' });
        // }

        // //cookieにアクセストークンを保存
        // res.cookie('jwt', accessToken, { httpOnly: true })

        // //redisにアクセストークンを保存

        // return JSON.stringify({"accessToken": accessToken});


        try {
            // passwoedは必須
            //現在パスワードが一致するか確認
            // 名前からユーザーを取得
            const user: User = await this.usersService.updateUser(req.user, userData);
            if (!user) {
                throw new ForbiddenException("Invalid credentials");
            }

            console.log("user: ", user);

            //データを更新して、アクセストークンを返す
            const accessToken: string = await this.usersService.generateJwt(user);

            if (!accessToken) {
                throw new ForbiddenException("Invalid credentials");
            }

            console.log("accessToken: " + accessToken);

            //cookieにアクセストークンを保存
            // localstrageよりcookieの方が安全
            // XSS, 有効期限の観点からもcookieの方が良い
            res.cookie('jwt', accessToken, { httpOnly: true })

            // //redisにアクセストークンを保存

            //return accessToken;
            return JSON.stringify({"accessToken": accessToken});
        } catch (error) {
            throw error;
        }
    }


    // 11 manba 15 バック
    // manba  mfny フロント
    // swagger mfny
    @UseGuards(JwtAuthGuard)
    // iconはformData.appendで送信すると保存される
    @UseInterceptors(FileInterceptor('icon', storage))
    @Post('/update/icon')
    async UpdateIcon(@UploadedFile() file, @Req() req): Promise<string> {
        // console.log("updateUserIcon")
        // console.log("file: ", file)
        // console.log("req.user.userName: ", req.user.userName)
        try {
            // 読み込み時にディレクトリを指定する
            const user = await this.usersService.updateUserIcon(req.user.userName, file);

            //例外を返す？
            if (!user) {
                throw new ForbiddenException("Invalid credentials");
            }

            return JSON.stringify({"status": "SUCCESS", "icon": user.icon});
        } catch (error) {
            console.log('error', error);
            throw error;
        }
    }

    // 使っていない
    //: Promise<Observable<StreamableFile>>
    @UseGuards(JwtAuthGuard)
    @Get('/icons/:iconName')
    async getIcon(@Param('iconName') icon: string, @Res() res: Response) {
        console.log("getIcon")
        // ファイルの読み込み

        // content-typeを設定する
        //res.setHeader('Content-Type', 'image/png');

        // corsを設定する
        //res.setHeader('Access-Control-Allow-Origin', '*');

        //return this.usersService.getUserIcon(icon);

        //of は、Observableを返す
        /*
        Observable
        Observableは、RxJSの中心的なクラスです。これはデータやイベントのストリームを表し、そのストリームを購読することで、ストリームに含まれるアイテムを非同期に受信して処理することができます。Observableは、時間の経過と共にゼロ個以上のデータアイテムを非同期に生成するプッシュベースのコレクションです。

        of
        ofは、与えられた引数から新しいObservableインスタンスを作成するための関数です。この関数は引数として受け取った値を順番に発行し、すぐに完了するObservableを返します。主にテストや簡単な値のストリームを作成する際に便利です。
        */
        return of(res.sendFile(icon, { root: process.env.AVATAR_IMAGE_DIR }));

        // return of(res.sendFile(
        //     path.join(process.env.AVATAR_IMAGE_DIR, icon),
        // ))

        //return of(res.sendFile(path.join(process.env.AVATAR_IMAGE_DIR, icon)));

        //return res.sendFile(icon, { root: process.env.AVATAR_IMAGE_DIR });
    }

    // curl -X GET -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJOYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEB0ZXN0IiwiaWF0IjoxNzAzNzU5NjU5LCJleHAiOjE3MDM3NjMyNTl9.R1TfxoDLp5kTOAAfIEGrkplZquRACJltQv3oGEANKDU" http://localhost:3001/users/me
    // JWTからユーザーを取得する　API
    @UseGuards(JwtAuthGuard)
    //@UseGuards(JwtAuthGuard, TwoFactorAuthGuard)
    @Get('/me')
    CurrentUser(@Req() req) : string {
        //throw new ForbiddenException("Invalid credentials");
        //const { password, ...user } = req.user;
        //const user: User = req.user;

        console.log("CurrentUser")

        const user: ReturnUserDto = {
            userId: req.user.userId,
            userName: req.user.userName,
            email: req.user.email,
            icon: req.user.icon,
            twoFactorAuth: req.user.twoFactorAuth,
            name42: req.user.name42,
            friends: req.user.friends,
            blocked: req.user.blocked,
            // 不要なので削除
            twoFactorAuthNow: false
        }

        //user.friends = []

        // const friend: User = {
        //     userId: 1,
        //     userName: "test",
        //     email: "test@test",
        //     icon: "test",
        //     twoFactorAuth: false,
        //     name42: "test",
        //     password: "test",
        //     createdAt: new Date(),
        //     deletedAt: new Date(),
        //     twoFactorAuthSecret: "test",
        //     friends: [],
        //     blocked: [],
        //     gameRooms: [],
        //     gameEntries: [],
        //     matchesAsPlayer1: [],
        //     matchesAsPlayer2: [],
        //     matchResults: [],
        // };

        // console.log(req.user.friends)

        // user.friends.push(friend)

        // console.log(req.user.friends)


        return JSON.stringify({"user": user});
    }

    // TODO: JWT GUARDを使う
    // TODO: サーバーサイドからのアクセスのみを許可するようにstrategyを設定する？IPを設定する？
    // サーバーサイドからアクセスする場合はjwtは不要
    //@UseGuards(JwtAuthGuard)
    @Get("/:name")
    async FindOneByName(@Param('name') name: string): Promise<string> {
        console.log("FindOneByName")
        const resultUser =  await this.usersService.findOneByName(name);


        const user: ReturnUserDto = {
            userId: resultUser.userId,
            userName: resultUser.userName,
            email: resultUser.email,
            icon: resultUser.icon,
            twoFactorAuth: resultUser.twoFactorAuth,
            name42: resultUser.name42,
            friends: resultUser.friends,
            blocked: resultUser.blocked,
            // 不要なので削除
            twoFactorAuthNow: false
        }

        console.log("user: ", user)

        return JSON.stringify({"user": user});

    }

    // 使っていない
    @UseGuards(JwtAuthGuard)
    //@UseGuards(JwtAuthGuard, TwoFactorAuthGuard)
    @Get('/all')
    FindAllUsers() {
        console.log("FindAllUsers")
        // passwordを除外する
        return classToPlain(this.usersService.findAll());
    }

    // 使っていない
    @UseGuards(JwtAuthGuard)
    //@UseGuards(JwtAuthGuard, TwoFactorAuthGuard)
    @Get('/:id')
    FindOne(@Req() req) {
        // passwordを除外する
        return classToPlain(this.usersService.findOne(req.params.id));
    }

    // friend UserInfoページからのアクセス
    @UseGuards(JwtAuthGuard)
    @Post('/friend/add/:userName')
    async addFriend(@Req() req, @Param('userName') userName: string) {
        //console.log("addFriend")
        return await this.usersService.addFriend(req.user, userName);
    }

    // 例外もそのまま返す
    @UseGuards(JwtAuthGuard)
    @Post('/friend/remove/:userName')
    async deleteFriend(@Req() req, @Param('userName') userName: string) {
        return await this.usersService.removeFriend(req.user, userName);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/friend/all')
    async findAllFriends(@Req() req) {
        return await this.usersService.getFriends(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/block/:userName')
    async blockUser(@Req() req, @Param('userName') userName: string) {
        return await this.usersService.blockUser(req.user, userName);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/unblock/:userName')
    async unblockUser(@Req() req, @Param('userName') userName: string) {
        return await this.usersService.unblockUser(req.user, userName);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/blocked/all')
    async findAllBlocked(@Req() req) {
        return await this.usersService.getBlockeds(req.user);
    }
}

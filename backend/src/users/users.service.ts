import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './users.repository';
import { SignUpUserDto, SignInUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from './interfaces/jwt_payload';
import * as bcrypt from 'bcrypt';
import { UserDto42 } from './dto/user42.dto';

//import jwt_decode from 'jwt-decode'

/*
Service
ビジネスロジックの実装: アプリケーションの核となるビジネスロジックを実装します。
データの加工・変換: ビジネスロジックに基づいてデータを加工・変換し、必要な形式にします。
リポジトリとの連携: データベースや他のストレージへのアクセスをリポジトリを通じて行います。
サードパーティサービスとの統合: 外部APIやサービスとの連携を管理します。
*/

@Injectable()
export class UsersService {
    constructor(
        // 依存性注入
        //@InjectRepository(User)
        //private userRepository: Repository<User>,
        //private connection: Connection,

        private userRepository: UserRepository,
        private jwtService: JwtService,
    ) {}

    //asyncは非同期処理
    //awaitを使うと、その行の処理が終わるまで次の行には進まない
    // async signUp(userData: SignUpUserDto): Promise<string> {
    //     var user: User = new User();
    //     user.userName = userData.userName;
    //     user.email = userData.email;
    //     user.password = userData.password;

    //     // ユーザーの作成
    //     const resultUser: User = await this.userRepository.createUser(user);
    //     //return resultUser;
    //     //return await this.userRepository.createUser(user);

    //     //JWTを返す？
    //     const payload: JwtPayload = { userId: resultUser.userId, userName: resultUser.userName, email: resultUser.email, twoFactorAuth: false };
    //     const accessToken: string = this.jwtService.sign(payload);
    //     return accessToken
    // }

    async signUp(userData: SignUpUserDto): Promise<User> {
        var user: User = new User();
        user.userName = userData.userName;
        user.email = userData.email;
        user.password = userData.password;

        // ユーザーの作成
        const resultUser: User = await this.userRepository.createUser(user);
        return resultUser;
        //return await this.userRepository.createUser(user);
    }

    // async signIn(userData: SignInUserDto): Promise<string> {
    //     // ユーザーの検索
    //     //const user: User = await this.userRepository.findOneByName(userData.userName);
    //     const user: User = await this.userRepository.findOne({ where: { userName: userData.userName }});


    //     // パスワードをハッシュ化
    //     // これでは確認できない
    //     // const salt = await bcrypt.genSalt();
    //     // const hashedPassword = await bcrypt.hash(userData.password, salt);

    //     // console.log("user.password: " + user.password)
    //     // console.log("userData.password: " + hashedPassword)

    //     // パスワードの検証
    //     // bcrypt.compare(userData.password, user.password) は、true or false を返す　ハッシュ値を比較している
    //     /*
    //         bcrypt.compare(userData.password, user.password) というコードが true を返す理由は、bcrypt ライブラリの比較メカニズムの仕組みにあります。bcrypt は、生のパスワード（ハッシュされていないパスワード）と、そのパスワードから生成されたハッシュ値を比較するために設計されています。

    //         ここでの動作は以下の通りです：

    //         ハッシュ生成: ユーザーがアカウントを作成する際、生のパスワード（userData.password）は bcrypt によってハッシュ化され、このハッシュ値がデータベースに保存されます（この例では user.password として参照されます）。

    //         パスワード検証: ユーザーがログインする際、入力された生のパスワード（userData.password）と、データベースに保存されたハッシュ値（user.password）が bcrypt.compare 関数に渡されます。

    //         ハッシュの比較: bcrypt.compare 関数は、入力された生のパスワードを同じハッシュ化プロセスで処理します。その後、この新しいハッシュ値をデータベースに保存されたハッシュ値と比較します。

    //         結果: もし入力されたパスワードが正しければ、同じハッシュ化プロセスによって同じハッシュ値が生成されるため、比較結果は true になります。パスワードが異なれば、異なるハッシュ値が生成され、結果は false になります。

    //         この方法により、セキュリティを確保しつつ、ユーザーが正しいパスワードを入力したかどうかを確認できます。重要なのは、実際のパスワード自体がデータベースに保存されることはなく、そのハッシュ値のみが保存されることです。これにより、もしデータベースが何らかの方法で漏洩した場合でも、実際のパスワードは保護されます。
    //     */
    //     if (user && bcrypt.compare(userData.password, user.password)) {
    //         // JWTを返す？ userを返すように変更
    //         const payload: JwtPayload = { userId: user.userId, userName: user.userName, email: user.email, twoFactorAuth: false };
    //         const accessToken: string = this.jwtService.sign(payload);
    //         return accessToken
    //     } else {
    //         //console.log("error")
    //         return null
    //     }
    // }

    // async signIn(userData: SignInUserDto): Promise<string> {
    //     // ユーザーの検索
    //     //const user: User = await this.userRepository.findOneByName(userData.userName);
    //     const user: User = await this.userRepository.findOne({ where: { userName: userData.userName }});


    //     // パスワードをハッシュ化
    //     // これでは確認できない
    //     // const salt = await bcrypt.genSalt();
    //     // const hashedPassword = await bcrypt.hash(userData.password, salt);

    //     // console.log("user.password: " + user.password)
    //     // console.log("userData.password: " + hashedPassword)

    //     // パスワードの検証
    //     // bcrypt.compare(userData.password, user.password) は、true or false を返す　ハッシュ値を比較している
    //     /*
    //         bcrypt.compare(userData.password, user.password) というコードが true を返す理由は、bcrypt ライブラリの比較メカニズムの仕組みにあります。bcrypt は、生のパスワード（ハッシュされていないパスワード）と、そのパスワードから生成されたハッシュ値を比較するために設計されています。

    //         ここでの動作は以下の通りです：

    //         ハッシュ生成: ユーザーがアカウントを作成する際、生のパスワード（userData.password）は bcrypt によってハッシュ化され、このハッシュ値がデータベースに保存されます（この例では user.password として参照されます）。

    //         パスワード検証: ユーザーがログインする際、入力された生のパスワード（userData.password）と、データベースに保存されたハッシュ値（user.password）が bcrypt.compare 関数に渡されます。

    //         ハッシュの比較: bcrypt.compare 関数は、入力された生のパスワードを同じハッシュ化プロセスで処理します。その後、この新しいハッシュ値をデータベースに保存されたハッシュ値と比較します。

    //         結果: もし入力されたパスワードが正しければ、同じハッシュ化プロセスによって同じハッシュ値が生成されるため、比較結果は true になります。パスワードが異なれば、異なるハッシュ値が生成され、結果は false になります。

    //         この方法により、セキュリティを確保しつつ、ユーザーが正しいパスワードを入力したかどうかを確認できます。重要なのは、実際のパスワード自体がデータベースに保存されることはなく、そのハッシュ値のみが保存されることです。これにより、もしデータベースが何らかの方法で漏洩した場合でも、実際のパスワードは保護されます。
    //     */
    //     if (user && bcrypt.compare(userData.password, user.password)) {
    //         // JWTを返す？ userを返すように変更
    //         const payload: JwtPayload = { userId: user.userId, userName: user.userName, email: user.email, twoFactorAuth: false };
    //         const accessToken: string = this.jwtService.sign(payload);
    //         return accessToken
    //     } else {
    //         //console.log("error")
    //         return null
    //     }
    // }

    async signIn(userData: SignInUserDto): Promise<User> {
        // ユーザーの検索
        //const user: User = await this.userRepository.findOneByName(userData.userName);
        const user: User = await this.userRepository.findOne({ where: { userName: userData.userName }});


        // パスワードをハッシュ化
        // これでは確認できない
        // const salt = await bcrypt.genSalt();
        // const hashedPassword = await bcrypt.hash(userData.password, salt);

        // console.log("user.password: " + user.password)
        // console.log("userData.password: " + hashedPassword)

        // パスワードの検証
        // bcrypt.compare(userData.password, user.password) は、true or false を返す　ハッシュ値を比較している
        /*
            bcrypt.compare(userData.password, user.password) というコードが true を返す理由は、bcrypt ライブラリの比較メカニズムの仕組みにあります。bcrypt は、生のパスワード（ハッシュされていないパスワード）と、そのパスワードから生成されたハッシュ値を比較するために設計されています。

            ここでの動作は以下の通りです：

            ハッシュ生成: ユーザーがアカウントを作成する際、生のパスワード（userData.password）は bcrypt によってハッシュ化され、このハッシュ値がデータベースに保存されます（この例では user.password として参照されます）。

            パスワード検証: ユーザーがログインする際、入力された生のパスワード（userData.password）と、データベースに保存されたハッシュ値（user.password）が bcrypt.compare 関数に渡されます。

            ハッシュの比較: bcrypt.compare 関数は、入力された生のパスワードを同じハッシュ化プロセスで処理します。その後、この新しいハッシュ値をデータベースに保存されたハッシュ値と比較します。

            結果: もし入力されたパスワードが正しければ、同じハッシュ化プロセスによって同じハッシュ値が生成されるため、比較結果は true になります。パスワードが異なれば、異なるハッシュ値が生成され、結果は false になります。

            この方法により、セキュリティを確保しつつ、ユーザーが正しいパスワードを入力したかどうかを確認できます。重要なのは、実際のパスワード自体がデータベースに保存されることはなく、そのハッシュ値のみが保存されることです。これにより、もしデータベースが何らかの方法で漏洩した場合でも、実際のパスワードは保護されます。
        */
        if (user && bcrypt.compare(userData.password, user.password)) {
            // JWTを返す？ userを返すように変更
            // const payload: JwtPayload = { userId: user.userId, userName: user.userName, email: user.email, twoFactorAuth: false };
            // const accessToken: string = this.jwtService.sign(payload);
            // return accessToken
            return user
        } else {
            //console.log("error")
            return null
        }
    }

    async generateJwt(user: User): Promise<string> {
        const payload: JwtPayload = { userId: user.userId, userName: user.userName, email: user.email, twoFactorAuth: false };
        const accessToken: string = this.jwtService.sign(payload);
        return accessToken
    }

    // Partial<User> は User の一部のプロパティを表す
    async currentUser(userData: SignUpUserDto): Promise<Partial<User>> {
        // ユーザーの検索
        //const user: User = await this.userRepository.findOneByName(userData.userName);
        const user: User = await this.userRepository.findOne({ where: { userName: userData.userName }});

        const { password, ...result } = user;
        return result
        //return user
    }

    async updateUser(userName: string, updateUser: UpdateUserDto): Promise<string> {
        const user = await this.userRepository.findOne({ where : { userName: userName }});
        if (!user) {
            // 例外を投げる
            return null;
        }
        // user.userName ? updateUser.userName : user.userName;
        // user.email ?  updateUser.email : user.email;
        // user.password ? updateUser.password: user.password;
        // user.twoFactorAuth ? updateUser.twoFactorAuth : user.twoFactorAuth;

        user.userName = updateUser.userName ? updateUser.userName : user.userName;
        user.email = updateUser.email ? updateUser.email : user.email;
        user.password = updateUser.password ? updateUser.password : user.password;
        //user.twoFactorAuth = updateUser.twoFactorAuth ? updateUser.twoFactorAuth : user.twoFactorAuth;

        console.log("updateUser1: ", updateUser)
        console.log("updateUser2: ", user)

        // if (user.twoFactorAuth) {
        //     user.twoFactorAuthSecret = user.userName
        // }

        // if (updateUser.icon) {
        //     user.icon = updateUser.icon;
        //     //画像を保存する
        // }
        const resultUser: User = await this.userRepository.saveUser(user);

        const payload: JwtPayload = { userId: resultUser.userId, userName: resultUser.userName, email: resultUser.email, twoFactorAuth: true  };
        const accessToken: string = this.jwtService.sign(payload);
        return accessToken
    }

    async updateUser2fa(userName: string, twoFactorAuth: boolean): Promise<User> {
        const user = await this.userRepository.findOne({ where : { userName: userName }});
        if (!user) {
            // 例外を投げる
            return null;
        }
        user.twoFactorAuth = twoFactorAuth;

        // これはいらない
        // if (twoFactorAuth) {
        //     user.twoFactorAuthSecret = user.userName
        // }
        const resultUser: User = await this.userRepository.saveUser(user);

        return resultUser
        
        // const payload: JwtPayload = { userId: resultUser.userId, userName: resultUser.userName, email: resultUser.email };
        // const accessToken: string = this.jwtService.sign(payload);
        // return accessToken
    }

    async updateUser2faSecret(userName: string, twoFactorAuthSecret: string): Promise<User> {
        const user = await this.userRepository.findOne({ where : { userName: userName }});
        if (!user) {
            // 例外を投げる
            return null;
        }
        user.twoFactorAuthSecret = twoFactorAuthSecret;
        const resultUser: User = await this.userRepository.saveUser(user);

        return resultUser

        // const payload: JwtPayload = { userId: resultUser.userId, userName: resultUser.userName, email: resultUser.email };
        // const accessToken: string = this.jwtService.sign(payload);
        // return accessToken
    }

    // async updateTwoFactorAuth(userName: string, twoFactorAuth: boolean): Promise<string> {
    //     const user = await this.userRepository.findOne({ where : { userName: userName }});
    //     if (!user) {
    //         // 例外を投げる
    //         return null;
    //     }
    //     user.twoFactorAuth = twoFactorAuth;
    //     if (twoFactorAuth) {
    //         user.twoFactorAuthSecret = user.userName
    //     }
    //     const resultUser: User = await this.userRepository.saveUser(user);
        
    //     const payload: JwtPayload = { userId: resultUser.userId, userName: resultUser.userName, email: resultUser.email };
    //     const accessToken: string = this.jwtService.sign(payload);
    //     return accessToken
    // }

    async findAll(): Promise<User[]> {
        return await this.userRepository.findAll();
    }

    async findOne(id: number): Promise<User | undefined> {
        return await this.userRepository.findOne({ where: { userId: id } });
    }

    async validateUser42(userData: UserDto42): Promise<User> {
        // ユーザーの検索
        const { name42 } = userData;
        let user: User = await this.userRepository.findOne({ where: { name42: name42 } });
        
        // ユーザーが存在する場合
        if (user) {
            return user;
        }

        // ユーザーが存在しない場合
        let { userName } = userData
        // ユーザー名のコンフリクトを避ける
        user = await this.userRepository.findOne({ where: { userName: name42 } });
        if (user) {
            // ユーザー名が既に存在する場合、ユーザー名を変更する
			const rand = Math.random().toString(16).substr(2, 5)
			userName = userName + '-' + rand
        }
        let newUser = new User()
        newUser.userName = userName
        newUser.name42 = name42
        newUser.email = userData.email
        newUser.password = userData.password
        newUser.icon = userData.icon
        newUser.twoFactorAuth = false
        newUser.twoFactorAuthSecret = ''
        newUser  = await this.userRepository.createUser42(newUser)
		return newUser
    }
}

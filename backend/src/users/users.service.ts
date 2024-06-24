/* eslint-disable */
import { Injectable, StreamableFile, BadRequestException,
  NotFoundException, ForbiddenException,
	HttpException,
	InternalServerErrorException, ConflictException, 
	UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './users.repository';
import { SignUpUserDto, SignInUserDto, UpdateUserDto, UpdatePointDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt_payload';
import * as bcrypt from 'bcrypt';
import { UserDto42 } from './dto/user42.dto';
import * as path from 'path';

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

  loginUserIds: number[] = [];

  addLoginUserId(id: number) {
    if (!this.isLoginUserId(id)) {
      //this.logger.log(`addLoginUserId: ${id}`);

      this.loginUserIds.push(id);
    }
  }

  removeLoginUserId(id: number) {
    if (this.isLoginUserId(id)) {
      //this.logger.log(`removeLoginUserId: ${id}`);

      this.loginUserIds = this.loginUserIds.filter(
        (loginUserId) => loginUserId !== id,
      );
    }
  }

  isLoginUserId(userId: number): boolean {
    // console.log('loginUserIds: ', this.loginUserIds);
    //return this.loginUserIds.includes(userId);
    if (this.loginUserIds.find((id) => id === userId)) {
      return true;
    }
    return false;
  }

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
    if (!userData.email || !userData.password || !userData.userName || (userData.password !== userData.passwordConfirm)) {
      //return null;
      throw new BadRequestException('Invalid credentials');
    }
    if (await this.userRepository.findOne({ where: { userName: userData.userName } })) {
      throw new ConflictException('user already exists');
    }
    const user: User = new User({});
    user.userName = userData.userName;
    user.email = userData.email;
    user.password = userData.password;

    // try catch　にする
    // ユーザーの作成
    // const resultUser: User = await this.userRepository.createUser(user);

    // if (user && bcrypt.compare(userData.password, user.password)) {
    //   //throw new ForbiddenException("Passwords do not match");
    //   //return res.status(400).json({ message: 'Passwords do not match' });
    //   return resultUser;
    // } else {
    //   console.log('error')
    //   return null;
    //   //return await this.userRepository.createUser(user);
    // }


    try {
      // ユーザーの作成
      const resultUser: User = await this.userRepository.createUser(user);

      // console.log('resultUser: ', resultUser.password);
      // console.log('userData.password: ', userData.password);

      // console.log(await bcrypt.compare(userData.password, resultUser.password))

      if (user && await bcrypt.compare(userData.password, resultUser.password)) {
        return resultUser;
      // } else {
        //throw new BadRequestException('Passwords do not match');
        throw new UnauthorizedException('Invalid credentials');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        // ここをerrorをそのまま返したい
        throw error;
      } else {
        throw new InternalServerErrorException();
      }
    }
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
    if (!userData.userName || !userData.password) {
      //return null;
      throw new BadRequestException('Invalid credentials');
    }
    // ユーザーの検索
    //const user: User = await this.userRepository.findOneByName(userData.userName);
    // const user: User = await this.userRepository.findOne({
    //   where: { userName: userData.userName },
    // });

    // // パスワードをハッシュ化
    // // これでは確認できない
    // // const salt = await bcrypt.genSalt();
    // // const hashedPassword = await bcrypt.hash(userData.password, salt);

    // // console.log("user.password: " + user.password)
    // // console.log("userData.password: " + hashedPassword)

    // // パスワードの検証
    // // bcrypt.compare(userData.password, user.password) は、true or false を返す　ハッシュ値を比較している
    // /*
    //         bcrypt.compare(userData.password, user.password) というコードが true を返す理由は、bcrypt ライブラリの比較メカニズムの仕組みにあります。bcrypt は、生のパスワード（ハッシュされていないパスワード）と、そのパスワードから生成されたハッシュ値を比較するために設計されています。

    //         ここでの動作は以下の通りです：

    //         ハッシュ生成: ユーザーがアカウントを作成する際、生のパスワード（userData.password）は bcrypt によってハッシュ化され、このハッシュ値がデータベースに保存されます（この例では user.password として参照されます）。

    //         パスワード検証: ユーザーがログインする際、入力された生のパスワード（userData.password）と、データベースに保存されたハッシュ値（user.password）が bcrypt.compare 関数に渡されます。

    //         ハッシュの比較: bcrypt.compare 関数は、入力された生のパスワードを同じハッシュ化プロセスで処理します。その後、この新しいハッシュ値をデータベースに保存されたハッシュ値と比較します。

    //         結果: もし入力されたパスワードが正しければ、同じハッシュ化プロセスによって同じハッシュ値が生成されるため、比較結果は true になります。パスワードが異なれば、異なるハッシュ値が生成され、結果は false になります。

    //         この方法により、セキュリティを確保しつつ、ユーザーが正しいパスワードを入力したかどうかを確認できます。重要なのは、実際のパスワード自体がデータベースに保存されることはなく、そのハッシュ値のみが保存されることです。これにより、もしデータベースが何らかの方法で漏洩した場合でも、実際のパスワードは保護されます。
    //     */
    // if (user && bcrypt.compare(userData.password, user.password)) {
    //   // JWTを返す？ userを返すように変更
    //   // const payload: JwtPayload = { userId: user.userId, userName: user.userName, email: user.email, twoFactorAuth: false };
    //   // const accessToken: string = this.jwtService.sign(payload);
    //   // return accessToken
    //   return user;
    // } else {
    //   //console.log("error")
    //   return null;
    // }

    try {
      const user: User = await this.userRepository.findOne({
        where: { userName: userData.userName },
      });

      if (user && await bcrypt.compare(userData.password, user.password)) {
        return user;
      } else {
        throw new UnauthorizedException('Invalid credentials');
      }
    }
    catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async generateJwt(user: User): Promise<string> {
    // console.log('generateJwt');
    const payload: JwtPayload = {
      userId: user.userId,
      userName: user.userName,
      email: user.email,
      twoFactorAuth: false,
    };
    // await?
    const accessToken: string = this.jwtService.sign(payload);
    return accessToken;
  }

  // not used
  // Partial<User> は User の一部のプロパティを表す
  // async currentUser(userData: SignUpUserDto): Promise<Partial<User>> {
  //   // ユーザーの検索
  //   //const user: User = await this.userRepository.findOneByName(userData.userName);
  //   const user: User = await this.userRepository.findOne({
  //     where: { userName: userData.userName },
  //   });

  //   const { password, ...result } = user;
  //   return result;
  //   //return user
  // }

  // async updateUser(userName: string, updateUser: UpdateUserDto): Promise<string> {
  //     const user = await this.userRepository.findOne({ where : { userName: userName }});
  //     if (!user) {
  //         // 例外を投げる
  //         return null;
  //     }
  //     // user.userName ? updateUser.userName : user.userName;
  //     // user.email ?  updateUser.email : user.email;
  //     // user.password ? updateUser.password: user.password;
  //     // user.twoFactorAuth ? updateUser.twoFactorAuth : user.twoFactorAuth;

  //     user.userName = updateUser.userName ? updateUser.userName : user.userName;
  //     user.email = updateUser.email ? updateUser.email : user.email;
  //     user.password = updateUser.password ? updateUser.password : user.password;
  //     //user.twoFactorAuth = updateUser.twoFactorAuth ? updateUser.twoFactorAuth : user.twoFactorAuth;

  //     console.log("updateUser1: ", updateUser)
  //     console.log("updateUser2: ", user)

  //     // if (user.twoFactorAuth) {
  //     //     user.twoFactorAuthSecret = user.userName
  //     // }

  //     // if (updateUser.icon) {
  //     //     user.icon = updateUser.icon;
  //     //     //画像を保存する
  //     // }
  //     const resultUser: User = await this.userRepository.saveUser(user);

  //     const payload: JwtPayload = { userId: resultUser.userId, userName: resultUser.userName, email: resultUser.email, twoFactorAuth: true  };
  //     const accessToken: string = this.jwtService.sign(payload);
  //     return accessToken
  // }


  // old
  // async updateUser(userName: string, updateUser: UpdateUserDto): Promise<User> {
  //   const user = await this.userRepository.findOne({ where: { userName: userName } });
  //   if (!user) {
  //     // 例外を投げる
  //     return null;
  //   }
  //   // user.userName ? updateUser.userName : user.userName;
  //   // user.email ?  updateUser.email : user.email;
  //   // user.password ? updateUser.password: user.password;
  //   // user.twoFactorAuth ? updateUser.twoFactorAuth : user.twoFactorAuth;

  //   const salt = await bcrypt.genSalt();
  //   const newPassword = await bcrypt.hash(updateUser.password, salt);

  //   user.userName = updateUser.userName ? updateUser.userName : user.userName;
  //   user.email = updateUser.email ? updateUser.email : user.email;
  //   user.password = updateUser.password ? newPassword : user.password;
  //   //user.twoFactorAuth = updateUser.twoFactorAuth ? updateUser.twoFactorAuth : user.twoFactorAuth;

  //   console.log('updateUser1: ', updateUser);
  //   console.log('updateUser2: ', user);

  //   // if (user.twoFactorAuth) {
  //   //     user.twoFactorAuthSecret = user.userName
  //   // }

  //   // if (updateUser.icon) {
  //   //     user.icon = updateUser.icon;
  //   //     //画像を保存する
  //   // }
  //   const resultUser: User = await this.userRepository.saveUser(user);

  //   // const payload: JwtPayload = { userId: resultUser.userId, userName: resultUser.userName, email: resultUser.email, twoFactorAuth: true  };
  //   // const accessToken: string = this.jwtService.sign(payload);
  //   // return accessToken

  //   return resultUser;
  // }

  async updateUser(user: User, updateUser: UpdateUserDto): Promise<User> {
    // const conflictUser = await this.userRepository.findOne({ where: { userName: updateUser.userName } });
    // if (conflictUser) {
    //   //return null;
    //   // console.log('User name already exists');
    //   throw new ConflictException('User name already exists');  
    // }

    // passwordの確認
    // updateUserのpasswordとuserのpasswordが一致するか確認
    // console.log(user.password)
    // console.log(updateUser.password)
    // console.log(await bcrypt.compare(updateUser.password, user.password))
    if (!(await bcrypt.compare(updateUser.password, user.password))) {
      //console.log('passwords do not match');
      //return null;
      throw new UnauthorizedException('Invalid credentials');
    }

    // データ更新
    // findしなくても、jwtでDBから取得したデータを使っているので、findしなくてもいい？
    // 懸念として、DBのユーザーとjwtのユーザーが異なる場合がある・・・？
    const targetUser = await this.userRepository.findOne({ where: { userName: user.userName } });
    if (!targetUser) {
      //console.log('user not found');
      //return null;
      throw new NotFoundException('User not found');
    }

    // console.log('targetUser: ', targetUser)

    // パスワードの更新
    // 新しいパスワードがある場合、かつ、新しいパスワードと新しいパスワードの確認が一致する場合
    if (updateUser.newPassword && updateUser.newPassword === updateUser.newPasswordConfirm) {
      const salt = await bcrypt.genSalt();
      targetUser.password = await bcrypt.hash(updateUser.newPassword, salt);
    } else if (updateUser.newPassword && updateUser.newPassword !== updateUser.newPasswordConfirm) {
      //return null;
      throw new BadRequestException('Passwords do not match');
    }
    
    targetUser.userName = updateUser.userName ? updateUser.userName : targetUser.userName;
    targetUser.email = updateUser.email ? updateUser.email : targetUser.email;

    // 更新後のデータを返す
    const resultUser: User = await this.userRepository.saveUser(targetUser);
    return resultUser;
  }

  // manbaを参考にする
  async updateUserIcon(userName: string, icon): Promise<User> {
    const user = await this.userRepository.findOne({ where: { userName: userName } });
    if (!user || !icon) {
      //return null
      throw new NotFoundException('User not found');
    }

    // delete Old Image
    if (user.icon) {
      const fs = require('fs');
      const filePath = path.join(process.cwd(), process.env.AVATAR_IMAGE_DIR, user.icon);
      fs.stat(filePath, (err: any, stats: any) => {
        if (err) {
          //console.error(err);
          //return;
          throw new NotFoundException('Image not found');
        }
        // 削除
        fs.unlink(filePath, (err: any) => {
          if (err) {
            //console.error(err);
            //return;
            throw new InternalServerErrorException();
          }
        });
      });
    }

    user.icon = icon.filename;
    //user.icon = `http://localhost:3001/api/uploads/${icon.filename}`;

    const resultUser: User = await this.userRepository.saveUser(user);

    if (!resultUser) {
      //return null;
      throw new InternalServerErrorException();
    }

    //console.log('resultUser: ', resultUser);
    return resultUser;
  }

  async getUserIcon(iconName: string): Promise<StreamableFile> {
    const fs = require('fs');
    const filePath = path.join(process.cwd(), process.env.AVATAR_IMAGE_DIR, iconName)

    // console.log('filePath: ', filePath)

    // ファイルが存在する場合
    if (fs.existsSync(filePath)) {
      const file = fs.createReadStream(filePath);
      // console.log('file: ', file);
      return new StreamableFile(file);
    } else {
      const file = fs.createReadStream(path.join(process.cwd(), process.env.AVATAR_IMAGE_DIR, 'default.png'));
      // console.log('file: ', file);
      return new StreamableFile(file);
    }
  }

  async updateUser2fa(userName: string, twoFactorAuth: boolean): Promise<User> {
    const user = await this.userRepository.findOne({ where: { userName: userName } });
    if (!user) {
      // 例外を投げる
      //return null;
      throw new NotFoundException('User not found');
    }
    user.twoFactorAuth = twoFactorAuth;

    // これはいらない
    // if (twoFactorAuth) {
    //     user.twoFactorAuthSecret = user.userName
    // }
    const resultUser: User = await this.userRepository.saveUser(user);

    return resultUser;

    // const payload: JwtPayload = { userId: resultUser.userId, userName: resultUser.userName, email: resultUser.email };
    // const accessToken: string = this.jwtService.sign(payload);
    // return accessToken
  }

  async updateUser2faSecret(userName: string, twoFactorAuthSecret: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { userName: userName } });
    if (!user) {
      // 例外を投げる
      //return null;
      throw new NotFoundException('User not found');
    }
    user.twoFactorAuthSecret = twoFactorAuthSecret;
    const resultUser: User = await this.userRepository.saveUser(user);

    return resultUser;

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

  async findAllByIds(ids: number[]): Promise<User[]> {
    return await this.userRepository.findAllByIds(ids);
  }

  // TODO: relation: friend, block
  async findOne(id: number): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { userId: id }, relations: ['friends', 'blocked'] });
  }

  // releation: friend, block
  async findOneByName(name: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { userName: name }, relations: ['friends', 'blocked'] });
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
    let { userName } = userData;
    // ユーザー名のコンフリクトを避ける
    user = await this.userRepository.findOne({ where: { userName: name42 } });
    if (user) {
      // ユーザー名が既に存在する場合、ユーザー名を変更する
      const rand = Math.random().toString(16).substr(2, 5);
      userName = userName + '-' + rand;
    }
    let newUser = new User({});
    newUser.userName = userName;
    newUser.name42 = name42;
    newUser.email = userData.email;
    newUser.password = userData.password;
    newUser.icon = userData.icon;
    newUser.twoFactorAuth = false;
    newUser.twoFactorAuthSecret = '';
    newUser = await this.userRepository.createUser42(newUser);
    return newUser;
  }

  // friend
  async addFriend(user: User, friendName: string): Promise<User> {
    return this.userRepository.addFriend(user, friendName);
    //return null;
  }

  async removeFriend(user: User, friendName: string): Promise<User> {
    return this.userRepository.removeFriend(user, friendName);
    //return null;
  }

  async getFriends(user: User): Promise<User[]> {
    return this.userRepository.getFriends(user);
  }

  // block
  async blockUser(user: User, blockName: string): Promise<User> {
    return this.userRepository.blockUser(user, blockName);
  }

  async unblockUser(user: User, blockName: string): Promise<User> {
    return this.userRepository.unblockUser(user, blockName);
  }

  async getBlockeds(user: User): Promise<User[]> {
    return this.userRepository.getBlockedUsers(user);
  }

  async updatePoint(data: UpdatePointDto): Promise<User> {
    return this.userRepository.updatePoint(data);
  }

  async getRanking(userName: string): Promise<number> {
    return this.userRepository.getRanking(userName);
  }
}
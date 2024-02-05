import { User } from '../entities/user.entity';
import { IsAlphanumeric, IsEmail, IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength, IsUrl } from "class-validator";
import { Match } from './match.decorator';

export class UserDto42 {
    // 不要
    //userId: number;

    @IsNotEmpty()
    @IsEmail()
    email!: string;

    // ログイン時に42nameがある場合は、パスワードのログインは不可
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(20)
    // 記号と英数字のみ
    // @Matches(/^[a-zA-Z0-]+$/, 
    //     { message: 'パスワードは英数字のみ使用できます' }
    // )
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
        { message: 'パスワードは大文字、小文字、数字、記号を含めてください' }
    )
    password!: string;

    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(20)
    @IsAlphanumeric()
    userName!: string;

    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(20)
    @IsAlphanumeric()
    name42!: string;

    @IsNotEmpty()
    @IsUrl()
    icon!: string;

}

export function toUserDto(user: User): UserDto42 {
    const { email, userName } = user;
    var userDto: UserDto42 = new UserDto42();
    userDto.email = email;
    userDto.userName = userName;
    return userDto;
}

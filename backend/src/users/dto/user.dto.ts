import { User } from '../entities/user.entity';
import { IsAlphanumeric, IsEmail, IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";
import { Match } from './match.decorator';

export class UserDto {
    // 不要
    //userId: number;

    @IsNotEmpty()
    @IsEmail()
    email: string;

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
    password: string;

    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(20)
    @Match('password',
        { message: 'パスワードが一致しません' }
    )
    passwordConfirm: string;

    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(20)
    @IsAlphanumeric()
    userName: string;
}

export function toUserDto(user: User): UserDto {
    const { email, userName } = user;
    var userDto: UserDto = new UserDto();
    userDto.email = email;
    userDto.userName = userName;
    return userDto;
}

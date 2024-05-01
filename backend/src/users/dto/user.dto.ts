/* eslint-disable */
import { User } from '../entities/user.entity';
import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumber,
  Length,
  Matches,
  MaxLength,
  MinLength,
  IsBoolean,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { Match } from './match.decorator';

//import { GameRecord } from '@/games/entities/gameRecord.entity';

export class SignUpUserDto {
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
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'パスワードは大文字、小文字、数字、記号を含めてください',
  })
  password: string;

  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  @Match('password', { message: 'パスワードが一致しません' })
    passwordConfirm: string;

  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  @IsAlphanumeric()
    userName: string;
}

export class SignInUserDto {
  // 不要
  //userId: number;

  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  // 記号と英数字のみ
  // @Matches(/^[a-zA-Z0-]+$/,
  //     { message: 'パスワードは英数字のみ使用できます' }
  // )
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'パスワードは大文字、小文字、数字、記号を含めてください',
  })
    password: string;

  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  @IsAlphanumeric()
    userName: string;
}

export class UpdateUserDto {
  // IsOptional()は、値がundefinedの場合はバリデーションをスキップする
  // 空の文字列も許可する場合は、@IsOptional()と@IsString()を組み合わせる
  //IsOptional()は、値がundefinedの場合はバリデーションをスキップする　
  // 空文字はスキップされないので@ValidateIfで条件を追加する
  //https://qiita.com/t-kubodera/items/2839ec4e4fe667b43f18
  @IsOptional()
  @ValidateIf((o, v) => v != null && v.length)
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @IsAlphanumeric()
    userName: string;

  @IsOptional()
  @ValidateIf((o, v) => v != null && v.length)
  @IsString()
  @IsEmail()
    email: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o, v) => v != null && v.length)
  @MinLength(4)
  @MaxLength(20)
  // 記号と英数字のみ
  // @Matches(/^[a-zA-Z0-]+$/,
  //     { message: 'パスワードは英数字のみ使用できます' }
  // )
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'パスワードは大文字、小文字、数字、記号を含めてください',
  })
    newPassword: string;

  @IsOptional()
  @ValidateIf((o, v) => v != null && v.length)
  //@IsOptionalOrEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Match('password', { message: 'パスワードが一致しません' })
    newPasswordConfirm: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  // 記号と英数字のみ
  // @Matches(/^[a-zA-Z0-]+$/,
  //     { message: 'パスワードは英数字のみ使用できます' }
  // )
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'パスワードは大文字、小文字、数字、記号を含めてください',
  })
    password: string;
}

export class ReturnUserDto {
  userId: number;
  userName: string;
  icon: string;
  friends: User[];
  blocked: User[];
  //gameRecords: GameRecord[];
  point: number;
}

export class UpdatePointDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  point: number;
}

// export function toUserDto(user: User): UserDto {
//     const { email, userName } = user;
//     var userDto: UserDto = new UserDto();
//     userDto.email = email;
//     userDto.userName = userName;
//     return userDto;
// }

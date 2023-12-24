import { User } from '../entities/user.entity';

export class UserDto {
    userId: number;
    email: string;
    password: string;
    passwordConfirm: string;
    userName: string;
}

export function toUserDto(user: User): UserDto {
    const { userId, email, userName } = user;
    var userDto: UserDto = new UserDto();
    userDto.userId = userId;
    userDto.email = email;
    userDto.userName = userName;
    return userDto;
}

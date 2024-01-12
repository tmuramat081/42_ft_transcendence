import { Injectable } from '@nestjs/common';
import { UserDto42 } from '../users/dto/user42.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt'
//import { JwtPayload } from './interfaces/jwt_payload';

// mfnyu 15, 16

@Injectable()
export class AuthService {
    constructor (private usersService: UsersService) {}

    async validateUser(user: UserDto42): Promise<User> {
        //return await this.usersService.findOneById(id);
        //return await this.usersService.findOneByName42(username);
        return await this.usersService.validateUser42(user);
    }

    // // JWT
    // async update2fa(user: User, updateUserData: UserDto42): Promise<User> {
    //     var updateUser: User = new User();
    //     updateUser.userName = user.userName;
    //     updateUser.email = user.email;
    //     updateUser.password = user.password;
    //     return await this.usersService.updateUser(user.userName, );
    // }

    // async verify2fa(user: UserDto42): Promise<User> {
    //     return await this.usersService.verify2fa(user);
    // }

    // async generate2faQrCode(user: UserDto42): Promise<string> {
    //     return await this.usersService.generateQrCode(user);
    // }
}

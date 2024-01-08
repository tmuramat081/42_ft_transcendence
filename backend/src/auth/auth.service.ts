import { Injectable } from '@nestjs/common';
import { UserDto42 } from '../users/dto/user42.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

// mfnyu 15, 16

@Injectable()
export class AuthService {
    constructor (private usersService: UsersService) {}

    async validateUser(user: UserDto42): Promise<User> {
        //return await this.usersService.findOneById(id);
        //return await this.usersService.findOneByName42(username);
        return await this.usersService.validateUser42(user);
    }
}

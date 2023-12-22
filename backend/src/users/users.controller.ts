import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
  } from '@nestjs/common';
  import { UsersService } from './users.service'; //Serviceの定義をインポート
  import { User } from './users.model';
  
  @Controller('users') //コントローラーの定義、ルートパスを指定
  export class UsersController {
    constructor(private readonly usersService: UsersService) {} //Serviceの定義をコンストラクターで引数に指定
  
    @Get() //ルートパスに対するGETリクエストを処理
    getAll(): User[] {
      return this.usersService.getAll();
    }
  
    @Post() //ルートパスに対するPOSTリクエストを処理
    addUser(
      @Body('id') id: string,
      @Body('nickname') nickname: string,
      @Body('password') password: string,
    ): User {
      const user: User = {
        id,
        nickname,
        password,
        level: 0,
      };
      return this.usersService.addUser(user);
    }
  
    @Get(':id') // /users/{id}
    findUser(@Param('id') id: string): User {
      return this.usersService.findUser(id);
    }
  
    @Patch(':id')
    updateLevel(@Param('id') id: string): User {
      return this.usersService.updateLevel(id);
    }
  
    @Delete(':id')
    deleteUser(@Param('id') id: string): void {
      this.usersService.deleteUser(id);
    }
  }
  

import { Injectable } from '@nestjs/common';
import { User } from './users.model';

@Injectable() //Serviceの定義
export class UsersService {
  private users: User[] = [];

  getAll(): User[] {
    return this.users;
  }

  addUser(user: User): User {
    this.users.push(user);
    return user;
  }

  findUser(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  updateLevel(id: string): User {
    const user: User = this.users.find((user) => user.id === id);
    if (user) user.level++;
    return user;
  }

  deleteUser(id: string): void {
    this.users = this.users.filter((user) => user.id !== id);
  }
}

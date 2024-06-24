/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { DataFactory, Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserSeeder implements Seeder {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // async run(factory: DataFactory): Promise<any> {
  //     await factory(User)().createMany(10);
  // }

  seed(): Promise<any> {
    return this.userRepository.save(DataFactory.createForClass(User).generate(100));
  }

  drop(): Promise<any> {
    //return this.userRepository.clear();
    return this.userRepository.delete({});
  }
}

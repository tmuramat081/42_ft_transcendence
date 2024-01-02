import { TypeOrmModule } from '@nestjs/typeorm';
import { seeder } from 'nestjs-seeder';
import { User } from '../users/entities/user.entity';
import { UserSeeder } from './seeders/user.seeder';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';


dotenv.config();
seeder({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            //バリデーション
            //required()は必須項目
            validationSchema: Joi.object({
              POSTGRESS_HOST: Joi.string().required(),
              POSTGRESS_PORT: Joi.number().required(),
              POSTGRESS_USER: Joi.string().required(),
              POSTGRESS_PASSWORD: Joi.string().required(),
              POSTGRESS_DB: Joi.string().required(),
            }),
          }),
          // forRootAsync()を使って非同期接続
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
              type: 'postgres',
              host: config.get<string>('POSTGRESS_HOST'),
              port: config.get<number>('POSTGRESS_PORT'),
              username: config.get<string>('POSTGRESS_USER'),
              password: config.get<string>('POSTGRESS_PASSWORD'),
              database: config.get<string>('POSTGRESS_DB'),
              entities: [User],
              synchronize: true,
            }),
        }),
        TypeOrmModule.forFeature([User]),
    ],
}).run([UserSeeder]);



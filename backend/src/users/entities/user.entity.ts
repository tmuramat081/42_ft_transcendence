
/*
Table user {
  user_id integer [pk]
  user_name varchar
  password varchar
  email varchar
  icon varchar
  created_at date
  updated_at date
}
*/

import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Timestamp, Unique } from "typeorm";

// 11 dto
// dtoにも
// 各フィールドのバリデーションを定義するために、class-validatorパッケージを使用する
import { IsAlphanumeric, IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength, MaxLength } from "class-validator";

// 14 seeder
// ダミーデータを作成するために、nest-seederパッケージを使用する
import { Factory } from "nestjs-seeder";

// 16
// 出力フィールドを制御するために、class-transformerパッケージを使用する
import { Exclude } from "class-transformer"; 


// entityはデータベースのテーブルを表す
// Uniqueはユニーク制約
@Entity('users')
@Unique(['userName', 'email'])
export class User {
    // @PrimaryGeneratedColumn()は主キーを自動生成する
    @PrimaryGeneratedColumn({ name: 'user_id', type: 'integer', unsigned: true})
    userId: number;

    @Column({ name: 'user_name', type: 'varchar', length: 20, unique: true })
    //@Factory(faker => faker.internet.userName())
    @Factory((faker) => faker.helpers.unique(faker.word.noun))
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(20)
    @IsAlphanumeric()
    @Matches(/^[a-zA-Z0-]+$/,
        { message: 'ユーザー名は英数字のみ使用できます' }
    )
    userName: string;

    @Column({ name: 'email', type: 'varchar', length: 100, unique: true})
    @Factory((faker) => faker.helpers.unique(faker.internet.email))
    @IsEmail()
    email: string;

    @Column({ name: 'password', type: 'varchar'})
    @Factory((faker) => faker.internet.password())
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
    @Exclude()
    password: string;

    @Column({ name: 'icon', type: 'text', default: ''})
    @Factory((faker) => faker.image.people())
    icon: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true})
    @Factory((faker) => faker.helpers.arrayElement([null, faker.date.future()]))
    deletedAt: Date;

    @Column({ type: 'varchar', length: 20,  default: ''})
    name42: string;

    @Column({ name: 'two_factor_auth', type: 'boolean', default: false, nullable: false})
    @Factory((faker) => faker.datatype.boolean())
    @Exclude()
    twoFactorAuth: boolean;

    @Column({ name: 'two_factor_auth_secret', type: 'text', nullable: true})
    @Exclude()
    twoFactorAuthSecret: string;
}
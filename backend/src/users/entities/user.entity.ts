
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

// entityはデータベースのテーブルを表す
// Uniqueはユニーク制約
@Entity('users')
@Unique(['userName', 'email'])
export class User {
    // @PrimaryGeneratedColumn()は主キーを自動生成する
    @PrimaryGeneratedColumn({ name: 'user_id', type: 'integer', unsigned: true})
    userId: number;

    @Column({ name: 'user_name', type: 'varchar', length: 20, unique: true })
    userName: string;

    @Column({ name: 'email', type: 'varchar', length: 100, unique: true})
    email: string;

    @Column({ name: 'password', type: 'varchar'})
    password: string;

    @Column({ name: 'icon', type: 'text', default: ''})
    icon: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp'})
    createdAt: Timestamp;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp'})
    deletedAt: Timestamp;

    @Column({ type: 'varchar', length: 20,  default: ''})
    name42: string;

    @Column({ name: 'two_factor_auth', type: 'boolean', default: false, nullable: false})
    twoFactorAuth: boolean;

    @Column({ name: 'two_factor_auth_secret', type: 'text', nullable: true})
    twoFactorAuthSecret: string;
}
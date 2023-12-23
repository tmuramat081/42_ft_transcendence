// 14 yu さんこう

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
@Unique(['user_name', 'email'])
export class User {
    // @PrimaryGeneratedColumn()は主キーを自動生成する
    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({ type: 'varchar', length: 20, unique: true })
    user_name: string;

    @Column({ type: 'varchar', length: 100, unique: true})
    email: string;

    @Column({ type: 'varchar'})
    password: string;

    @Column({ type: 'text'})
    icon: string;

    @CreateDateColumn({type: 'timestamp'})
    created_at: Timestamp;

    @DeleteDateColumn({type: 'timestamp'})
    deleted_at: Timestamp;

    @Column({ type: 'varchar', length: 20,  default: ''})
    name42: string;

    @Column({ type: 'boolean', default: false, nullable: false})
    two_factor_auth: boolean;

    @Column({ type: 'text', nullable: true})
    two_factor_auth_secret: string;
}
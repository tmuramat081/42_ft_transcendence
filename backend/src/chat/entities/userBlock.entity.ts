import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BlockedUser } from './blockedUser.entity';

@Entity()
export class UserBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  userName: string;

  // ユーザーがブロックしたユーザーのリストを保持する関係を定義する
  @OneToMany(() => BlockedUser, (blockedUser: BlockedUser) => blockedUser.blockedBy)
  blockedUsers: BlockedUser[];
}

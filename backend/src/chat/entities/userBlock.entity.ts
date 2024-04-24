import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
// import { BlockedUser } from './blockedUser.entity';

// ユーザーがブロックしたユーザーのリストを保持するためのエンティティ
@Entity()
export class UserBlock {
  @PrimaryGeneratedColumn()
  id: number;

  // ブロックを行ったユーザー
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User; // ユーザーとの関連付け

  // ブロックされたユーザーのIDリスト
  @Column('simple-array')
  blockedUsers: number[];
}

import { Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BlockedUser } from './blockedUser.entity';

// ユーザーがブロックしたユーザーのリストを保持するためのエンティティ
@Entity()
export class UserBlock {
  @PrimaryGeneratedColumn()
  id: number;

  // ブロックを行ったユーザー
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  // ブロックしたユーザーを複数保存
  @OneToMany(() => BlockedUser, (blockedUser: BlockedUser) => blockedUser.blockedUser)
  @JoinColumn({ name: 'blockedUserId' })
  blockedUsers: BlockedUser[];
}
import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserBlock } from './userBlock.entity';

// ブロックされたユーザーの情報を保持するためのエンティティ
@Entity()
export class BlockedUser {
  @PrimaryGeneratedColumn()
  id: number;

  // ブロックされたユーザー
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'blockedUserId' })
  blockedUser: User;

  // どのユーザー達によってブロックされているか
  @OneToMany(() => UserBlock, (userBlock) => userBlock.blockedUsers)
  userBlocks: UserBlock[];
}

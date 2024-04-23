import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserBlock } from './userBlock.entity';

// ブロックされたユーザーの情報を保持するためのエンティティ
@Entity()
export class BlockedUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  blockedUserId: number; // ユーザーのIDを参照する外部キー

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'blockedUserId' })
  blockedUser: User; // ユーザーとの関連付け

  // ブロックされたユーザーが誰によってブロックされたかを示す関係を定義する
  @ManyToOne(() => UserBlock, (userBlock) => userBlock.blockedUsers)
  blockedBy: UserBlock;
}

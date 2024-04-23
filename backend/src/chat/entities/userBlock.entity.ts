import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BlockedUser } from './blockedUser.entity';

// ユーザーがブロックしたユーザーのリストを保持するためのエンティティ
@Entity()
export class UserBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  userId: number; // ユーザーのIDを参照する外部キー

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User; // ユーザーとの関連付け

  // userがブロックした複数のユーザーのリスト
  @OneToMany(() => BlockedUser, (blockedUser: BlockedUser) => blockedUser.blockedBy)
  blockedUsers: BlockedUser[];
}

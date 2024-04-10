import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserBlock } from './userBlock.entity';

@Entity()
export class BlockedUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  userName: string;

  // ブロックされたユーザーが誰によってブロックされたかを示す関係を定義する
  @ManyToOne(() => UserBlock, (user) => user.blockedUsers)
  blockedBy: UserBlock;
}

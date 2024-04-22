import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class DmLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  senderId: number; // ユーザーのIDを参照する外部キー

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'senderId' })
  sender: User; // ユーザーとの関連付け

  @Column({ nullable: false })
  recipientId: number; // ユーザーのIDを参照する外部キー

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'recipientId' })
  recipient: User; // ユーザーとの関連付け

  @Column()
  message: string;

  @Column({ nullable: false })
  timestamp: string;
}

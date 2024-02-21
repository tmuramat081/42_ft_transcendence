import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class DirectMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderId: string;

  @Column()
  recipientId: string;

  @Column()
  message: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @ManyToOne(() => User, (user) => user.sentMessages)
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  recipient: User;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { DM_User } from './dm-user.entity';

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

  @ManyToOne(() => DM_User, (user) => user.sentMessages)
  sender: DM_User;

  @ManyToOne(() => DM_User, (user) => user.receivedMessages)
  recipient: DM_User;
}

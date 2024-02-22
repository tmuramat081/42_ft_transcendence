import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { DmUser } from './dmUser.entity';

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
  timestamp: string;

  @ManyToOne(() => DmUser, (user) => user.sentMessages)
  sender: DmUser;

  @ManyToOne(() => DmUser, (user) => user.receivedMessages)
  recipient: DmUser;
}

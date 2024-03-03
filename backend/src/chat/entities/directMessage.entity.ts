import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
// import { CurrentUser } from './currentUser.entity';

@Entity()
export class DirectMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderName: string;

  @Column()
  recipientName: string;

  @Column()
  message: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: string;

  // @ManyToOne(() => CurrentUser, (user) => user.sentMessages)
  // sender: CurrentUser;

  // @ManyToOne(() => CurrentUser, (user) => user.receivedMessages)
  // recipient: CurrentUser;
}

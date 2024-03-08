import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class DmLog {
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
}

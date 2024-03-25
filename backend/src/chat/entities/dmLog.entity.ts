import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class DmLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  senderName: string;

  @Column({ nullable: false })
  recipientName: string;

  @Column()
  message: string;

  @Column({ nullable: false })
  timestamp: string;
}

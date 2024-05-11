import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class DmLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  senderId: number;

  @Column({ nullable: false })
  recipientId: number;

  @Column()
  message: string;

  @Column({ nullable: false })
  timestamp: string;
}

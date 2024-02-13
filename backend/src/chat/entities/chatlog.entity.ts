import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class ChatLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomID: string;

  @Column()
  sender: User;

  @Column()
  message: string;

  @Column()
  timestamp: string;
}

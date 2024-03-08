import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// import { User } from '../../users/entities/user.entity';
// import { Room } from './room.entity';

@Entity()
export class ChatLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomName: string;

  @Column()
  sender: string;

  @Column()
  icon: string;

  @Column()
  message: string;

  @Column()
  timestamp: string;
}

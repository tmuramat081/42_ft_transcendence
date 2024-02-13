import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Room } from './room.entity';
// import { User } from '../../users/entities/user.entity';

@Entity()
export class ChatLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomID: string;

  @Column()
  sender: string;

  @Column()
  message: string;

  @Column()
  timestamp: string;

  // ManyToOneリレーションシップを定義する
  @ManyToOne(() => Room, (room) => room.chatLogs)
  room: Room;
}

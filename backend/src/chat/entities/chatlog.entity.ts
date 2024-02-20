import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Sender } from '../chat.gateway';
import { User } from '../../users/entities/user.entity';
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
  message: string;

  @Column()
  timestamp: string;

  // // ManyToOneリレーションシップを定義する
  // @ManyToOne(() => Room, (room) => room.chatLogs)
  // room: Room;
}

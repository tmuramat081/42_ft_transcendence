import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

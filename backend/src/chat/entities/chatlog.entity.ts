import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ChatLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomID: string;

  @Column()
  userID: string;

  @Column()
  message: string;

  @Column()
  timestamp: string;
}

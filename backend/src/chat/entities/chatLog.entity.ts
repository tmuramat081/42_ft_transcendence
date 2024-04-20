import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ChatLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  roomName: string;

  @Column({ nullable: false })
  sender: string;

  @Column()
  icon: string;

  @Column()
  message: string;

  @Column({ nullable: false })
  timestamp: string;
}

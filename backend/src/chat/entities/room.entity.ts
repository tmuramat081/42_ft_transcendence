import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// import { ChatLog } from './chatLog.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomName: string;

  @Column('json', { nullable: true })
  roomParticipants: { id: number; name: string; icon: string }[];

  // // OneToManyリレーションシップを定義する
  // @OneToMany(() => ChatLog, (chatLog) => chatLog.roomName)
  // chatLogs: ChatLog[];
}

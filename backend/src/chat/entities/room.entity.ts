import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// import { User } from '../../users/entities/user.entity';
// import { ChatLog } from './chatLog.entity';
// import { OnlineUsers } from './onlineUsers.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomName: string;

  @Column('json', { nullable: true })
  roomParticipants: { id: string; name: string; icon: string }[];

  // // OneToManyリレーションシップを定義する
  // @OneToMany(() => ChatLog, (chatLog) => chatLog.roomName)
  // chatLogs: ChatLog[];
}

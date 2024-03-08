import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChatLog } from './chatLog.entity';
// import { OnlineUsers } from './onlineUsers.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomName: string;

  @Column('json', { nullable: true })
  roomParticipants: { id: string; name: string; icon: string }[];

  // メンバー情報を格納するための関連付け
  @ManyToMany(() => User)
  @JoinTable()
  members: User[];

  // OneToManyリレーションシップを定義する
  @OneToMany(() => ChatLog, (chatLog) => chatLog.roomName)
  chatLogs: ChatLog[];
}

import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChatLog } from './chatlog.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomName: string;

  // メンバー情報を格納するための関連付け
  @ManyToMany(() => User)
  @JoinTable()
  members: User[];

  // OneToManyリレーションシップを定義する
  @OneToMany(() => ChatLog, (chatLog) => chatLog.roomName)
  chatLogs: ChatLog[];
}

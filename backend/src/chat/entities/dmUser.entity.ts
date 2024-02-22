import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DirectMessage } from './directMessage.entity';

@Entity()
export class DmUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column()
  icon: string;

  @OneToMany(() => DirectMessage, (message) => message.sender, { eager: true })
  sentMessages: DirectMessage[];

  @OneToMany(() => DirectMessage, (message) => message.recipient, { eager: true })
  receivedMessages: DirectMessage[];
}

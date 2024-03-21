import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class OnlineUsers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column({ default: false })
  me: boolean;
}

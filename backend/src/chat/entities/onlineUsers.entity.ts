import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class OnlineUsers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  name: string;

  @Column()
  icon: string;

  @Column({ default: false })
  me: boolean;
}

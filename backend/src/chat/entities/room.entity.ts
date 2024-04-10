import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  roomName: string;

  @Column('json', { nullable: true })
  roomParticipants: { id: number; name: string; icon: string }[];
}

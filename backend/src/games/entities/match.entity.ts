import { Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export class Match {
  @PrimaryGeneratedColumn({ name: 'match_id', type: 'integer', unsigned: true })
  matchId: number;

  @Column({ name: 'start_datetime', type: 'timestamp' })
  startDatetime: Date;

  @Column({ name: 'created_user', type: 'integer', unsigned: true })
  createdUser: number;

  @UpdateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}

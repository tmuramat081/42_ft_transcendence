import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Match } from './match.entity';
import { User } from '../../users/entities/user.entity';

// 試合結果テーブル
@Entity('match_result')
export class MatchResult {
  /** カラム定義 */
  // 結果ID
  @PrimaryGeneratedColumn({
    name: 'match_result_id',
    type: 'integer',
    unsigned: true,
  })
  readonly matchResultId!: number;

  // 試合ID
  @Column({
    name: 'match_id',
    type: 'integer',
    unsigned: true,
    comment: '試合ID',
  })
  matchId!: number;

  // ユーザーID
  @Column({ name: 'user_id', type: 'integer', unsigned: true, comment: 'ユーザーID' })
  userId!: number;

  // スコア
  @Column({
    name: 'score',
    type: 'integer',
    unsigned: true,
    comment: 'スコア',
  })
  score?: number | null;

  // 結果
  @Column({
    name: 'result',
    type: 'integer',
    nullable: true,
    comment: '結果',
  })
  result?: string | null;

  // 作成日時
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    comment: '作成日時',
  })
  readonly createdAt!: Date;

  /** リレーション定義 */
  // 試合テーブルと多対1の関係
  @ManyToOne(() => Match, (match) => match.matchResults)
  @JoinColumn({ name: 'match_id' })
  match: Match;

  // ユーザーテーブルと多対1の関係
  @ManyToOne(() => User, (user) => user.matchResults)
  @JoinColumn({ name: 'user_id' })
  user: User;

  constructor(partial: Partial<MatchResult>) {
    Object.assign(this, partial);
  }
}

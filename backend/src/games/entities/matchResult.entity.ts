import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('match_result')
export class MatchResult {
  /**
   * カラム定義
   */

  // 試合結果ID
  @PrimaryGeneratedColumn({
    name: 'match_result_id',
    type: 'integer',
    unsigned: true,
  })
  readonly matchResultId!: number;

  // ユーザーID
  @Column({ name: 'user_id', type: 'integer', unsigned: true })
  userId!: number;

  // 試合ID
  @Column({ name: 'match_id', type: 'integer', unsigned: true })
  matchId!: number;

  // スコア
  @Column({ name: 'score', type: 'integer', unsigned: true })
  score?: number;

  // 結果
  @Column({ name: 'result', type: 'integer', length: 20 })
  result?: string;

  // 作成日時
  @Column({ name: 'created_at', type: 'timestamp' })
  readonly createdAt!: Date;

  // 更新日時
  @Column({ name: 'updated_at', type: 'timestamp' })
  readonly updatedAt?: Date;

  /**
   * リレーション定義
   */

  // ユーザー
  @ManyToOne(() => User, (user) => user.userId)
  user: User[];

  constructor(partial: Partial<MatchResult>) {
    Object.assign(this, partial);
  }
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GameRoom } from './gameRoom.entity';
import { MatchResult } from './matchResult.entity';
import { User } from '../../users/entities/user.entity';

/** 試合テーブル */
@Entity('match')
export class Match {
  /** カラム定義 */
  // 試合ID
  @PrimaryGeneratedColumn({
    name: 'match_id',
    type: 'integer',
    unsigned: true,
    comment: '試合ID',
  })
  matchId!: number;

  // ゲームルームID
  @Column({
    name: 'game_room_id',
    type: 'integer',
    unsigned: true,
    comment: 'ゲームルームID',
  })
  gameRoomId!: number;

  // プレイヤー1のユーザー
  @Column({
    name: 'player1_id',
    type: 'integer',
    unsigned: true,
    comment: 'プレイヤー1のユーザー',
  })
  player1_id!: number;

  // プレイヤー2のユーザー
  @Column({
    name: 'player2_id',
    type: 'integer',
    unsigned: true,
    comment: 'プレイヤー2のユーザー',
  })
  player2_id!: number;

  // 試合開始時間
  @Column({
    name: 'start_time',
    type: 'timestamp',
    nullable: true,
    comment: '試合開始時間',
  })
  startTime?: Date;

  // 試合終了時間
  @Column({
    name: 'end_time',
    type: 'timestamp',
    nullable: true,
    comment: '試合終了時間',
  })
  endTime?: Date;

  // 作成日時
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    comment: '作成日時',
  })
  readonly createdAt!: Date;

  // 更新日時
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
    comment: '更新日時',
  })
  updated_at?: Date;

  /** リレーション */
  // 試合結果テーブルと1対多の関係
  @OneToMany(() => MatchResult, (matchResult) => matchResult.match)
  matchResults!: MatchResult[];

  // ゲームルームテーブルと多対1の関係
  @ManyToOne(() => GameRoom, (gameRoom) => gameRoom.matches)
  @JoinColumn({ name: 'game_room_id' })
  gameRoom!: GameRoom;

  // ユーザーテーブルと多対1の関係
  @ManyToOne(() => User, (user) => user.matchesAsPlayer1)
  @JoinColumn({ name: 'player1_id' })
  player1!: User;

  // ユーザーテーブルと多対1の関係
  @ManyToOne(() => User, (user) => user.matchesAsPlayer2)
  @JoinColumn({ name: 'player2_id' })
  player2!: User;

  /** コンストラクタ */
  constructor(partial: Partial<Match>) {
    Object.assign(this, partial);
  }
}

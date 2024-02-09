import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GameRoom } from './gameRoom.entity';
import { User } from '../../users/entities/user.entity';

/** ゲーム参加者テーブル */
@Entity('game_entry')
export class GameEntry {
  /** カラム */
  // ゲームエントリーID
  @PrimaryGeneratedColumn({
    name: 'game_entry_id',
    type: 'integer',
    unsigned: true,
    comment: 'ゲームエントリーID',
  })
  readonly gameEntryId!: number;

  // ルームID
  @Column({
    name: 'game_room_id',
    type: 'integer',
    unsigned: true,
    comment: 'ルームID',
  })
  gameRoomId!: number;

  // ユーザーID
  @Column({
    name: 'user_id',
    type: 'integer',
    unsigned: true,
    comment: 'ユーザーID',
  })
  userId!: number;

  // プレーヤー名
  @Column({
    name: 'player_name',
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: 'プレーヤー名',
  })
  playerName!: string;

  // 管理者フラグ
  @Column({
    name: 'admin_flag',
    type: 'boolean',
    default: false,
    comment: '管理者フラグ',
  })
  administratorFlag = false;

  // 作成日時
  @Column({
    name: 'created_at',
    type: 'timestamp',
    comment: '作成日時',
  })
  readonly createdAt!: Date;

  // 更新日時
  @Column({
    name: 'updated_at',
    type: 'timestamp',
    comment: '更新日時',
  })
  updatedAt?: Date;

  /** リレーション */
  // ユーザーテーブルと多対1の関係
  @ManyToOne(() => User, (user) => user.gameEntries)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // ゲームルームテーブルと多対1の関係
  @ManyToOne(() => GameRoom, (gameRoom) => gameRoom.gameEntries)
  @JoinColumn({ name: 'game_room_id' })
  gameRoom!: GameRoom;

  /** コンストラクタ */
  constructor(partial: Partial<GameEntry>) {
    Object.assign(this, partial);
  }
}

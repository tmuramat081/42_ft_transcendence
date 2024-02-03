import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GameEntry } from './gameEntry.entity';
import { Match } from './match.entity';
import { User } from 'src/users/entities/user.entity';
import { GAME_ROOM_STATUS } from '../game.contant';

/**
 * ゲームルームテーブル
 */
@Entity('game_room')
export class GameRoom {
  // ゲームルームID
  @PrimaryGeneratedColumn({
    name: 'game_room_id',
    type: 'integer',
    unsigned: true,
    comment: 'ゲームルームID',
  })
  gameRoomId!: number;

  // ルーム名
  @Column({
    name: 'room_name',
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: 'ルーム名',
  })
  roomName!: string;

  // 備考
  @Column({
    name: 'note',
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: '備考',
  })
  note?: string;

  // 最大プレーヤー数
  @Column({
    name: 'max_players',
    type: 'integer',
    unsigned: true,
    nullable: false,
    comment: '最大プレーヤー数',
  })
  maxPlayers!: number;

  // ルーム状態
  @Column({
    name: 'room_status',
    type: 'enum',
    enum: GAME_ROOM_STATUS,
    nullable: false,
    comment: 'ルーム状態',
  })
  roomStatus!: Valueof<typeof GAME_ROOM_STATUS>;

  // 作成ユーザー
  @Column({
    name: 'created_user',
    type: 'integer',
    unsigned: true,
    nullable: false,
    comment: '作成者',
  })
  readonly createdUser!: number;

  // 作成日時
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
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
  updated_at?: Date | null = null;

  /** リレーション */
  // ゲーム参加者テーブルと1対多の関係
  @OneToMany(() => GameEntry, (gameEntry) => gameEntry.gameRoom)
  gameEntries!: GameEntry[];

  // 試合テーブルと1対多の関係
  @OneToMany(() => Match, (match) => match.gameRoom)
  matches!: Match[];

  // ユーザーテーブルと多対1の関係
  @ManyToOne(() => User, (user) => user.gameRooms)
  user!: User;

  /** コンストラクタ */
  constructor(partial: Partial<GameRoom>) {
    Object.assign(this, partial);
  }
}

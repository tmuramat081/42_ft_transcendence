/* eslint-disable */
import { Match } from './../../games/entities/match.entity';
import { MatchResult } from '../../games/entities/matchResult.entity';
import { GameRoom } from '../../games/entities/gameRoom.entity';
import { GameEntry } from '../../games/entities/gameEntry.entity';

/*
Table user {
  user_id integer [pk]
  user_name varchar
  password varchar
  email varchar
  icon varchar
  created_at date
  updated_at date
}
*/

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  ManyToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  Unique,
  JoinTable,
} from 'typeorm';

// 11 dto
// dtoにも
// 各フィールドのバリデーションを定義するために、class-validatorパッケージを使用する
import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

// 14 seeder
// ダミーデータを作成するために、nest-seederパッケージを使用する
import { Factory } from 'nestjs-seeder';

// 16
// 出力フィールドを制御するために、class-transformerパッケージを使用する
import { Exclude } from 'class-transformer';

import { GameRecord } from '@/games/entities/gameRecord';

// entityはデータベースのテーブルを表す
// Uniqueはユニーク制約
@Entity('users')
@Unique(['userName', 'email'])
export class User {
  // @PrimaryGeneratedColumn()は主キーを自動生成する
  @PrimaryGeneratedColumn({ name: 'user_id', type: 'integer', unsigned: true })
    userId: number;

  @Column({ name: 'user_name', type: 'varchar', length: 20, unique: true })
  //@Factory(faker => faker.internet.userName())
  @Factory((faker) => faker.helpers.unique(faker.word.noun))
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  @IsAlphanumeric()
  @Matches(/^[a-zA-Z0-]+$/, { message: 'ユーザー名は英数字のみ使用できます' })
    userName: string;

  @Column({ name: 'email', type: 'varchar', length: 100, unique: true })
  @Factory((faker) => faker.helpers.unique(faker.internet.email))
  @IsEmail()
    email: string;

  @Column({ name: 'password', type: 'varchar' })
  @Factory((faker) => faker.internet.password())
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  // 記号と英数字のみ
  // @Matches(/^[a-zA-Z0-]+$/,
  //     { message: 'パスワードは英数字のみ使用できます' }
  // )
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'パスワードは大文字、小文字、数字、記号を含めてください',
  })
  @Exclude()
    password: string;

  @Column({ name: 'icon', type: 'text', default: '' })
  @Factory((faker) => faker.image.people())
    icon: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  @Factory((faker) => faker.helpers.arrayElement([null, faker.date.future()]))
    deletedAt: Date;

  @Column({ type: 'varchar', length: 20, default: '' })
    name42: string;

  @Column({ name: 'two_factor_auth', type: 'boolean', default: false, nullable: false })
  @Factory((faker) => faker.datatype.boolean())
  @Exclude()
    twoFactorAuth: boolean;

  @Column({ name: 'two_factor_auth_secret', type: 'text', nullable: true })
  @Exclude()
    twoFactorAuthSecret: string;

  // 簡単な配列でも使える
  // @Column('simple-array')
	//   friends: string[]

  // @Column('simple-array')
	//   blockedUsers: string[]

  // friend
  /** リレーション定義 */
  @ManyToMany(() => User)
  @JoinTable({
    // テーブル名
    name: "user_friends_user",
    // 自分のカラム名
    joinColumn: {
      name: "receiver",
      referencedColumnName: "userId"
    },
    // 相手のカラム名
    inverseJoinColumn: {
      name: "sender",
      referencedColumnName: "userId"
    }
  })
  friends: User[];

  @ManyToMany(() => User)
  @JoinTable({
    name: "user_block_user",
    joinColumn: {
      name: "blocker",
      referencedColumnName: "userId"
    },
    inverseJoinColumn: {
      name: "blocked",
      referencedColumnName: "userId"
    }
  })
  blocked: User[];

  /** リレーション定義 */
  // ゲームルームテーブルと1対多の関係
  @OneToMany(() => GameRoom, (gameRoom) => gameRoom.user)
    gameRooms: GameRoom[];

  // ゲーム参加者テーブルと1対多の関係
  @OneToMany(() => GameEntry, (gameEntry) => gameEntry.user)
    gameEntries!: GameEntry[];

  // 試合テーブルと1対多の関係
  @OneToMany(() => Match, (match) => match.player1)
    matchesAsPlayer1!: Match[];
  @OneToMany(() => Match, (match) => match.player2)
  matchesAsPlayer2!: Match[];

  // 試合結果テーブルと1対多の関係
  @OneToMany(() => MatchResult, (matchResult) => matchResult.user)
    matchResults!: MatchResult[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  @ManyToMany(() => GameRecord)
  @JoinTable({
    // テーブル名
    name: "user_game_record",
    // 自分のカラム名
    joinColumn: {
      name: "user",
      referencedColumnName: "userId"
    },
    // 相手のカラム名
    inverseJoinColumn: {
      name: "gameRecord",
      referencedColumnName: "gameRecordId"
    }
  })
    gameRecords: GameRecord[];

  @OneToMany(() => GameRecord, (gameRecord) => gameRecord.loser)
    gameRecordsAsLoser: GameRecord[];

  @OneToMany(() => GameRecord, (gameRecord) => gameRecord.winner)
    gameRecordsAsWinner: GameRecord[];
}

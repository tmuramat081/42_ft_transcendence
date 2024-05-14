import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  roomName: string;

  @Column('json', { nullable: true })
  roomParticipants: { id: number; name: string; icon: string }[];

  // 公開、非公開、パスワード保護の設定
  @Column({ nullable: false })
  roomType: string;

  // パスワード保護の場合のパスワード
  @Column({ nullable: true })
  roomPassword: string;

  // ルームのオーナー
  @Column({ nullable: false })
  roomOwner: number;

  // ルームの管理者
  @Column('json', { nullable: false })
  roomAdmin: number;

  // キック・禁止ユーザー
  @Column('json', { nullable: true })
  roomBlocked: number[];

  // ミュートユーザーとミュート期間
  @Column('json', { nullable: true })
  roomMuted: { id: number; mutedUntil: Date }[];

  // ルームの作成日時
  @Column({ nullable: false })
  createdAt: Date;
}

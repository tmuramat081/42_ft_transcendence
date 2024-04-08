import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { User } from '@/users/entities/user.entity';

  // ゲームの結果
  @Entity('game_record')
  export class GameRecord {
    @PrimaryGeneratedColumn({
        name: 'game_record_id',
        type: 'integer',
        unsigned: true,
        comment: 'ゲーム記録ID',
    })
    readonly gameRecordId!: number;

    @Column({
        name: 'winner_score',
        type: 'integer',
        unsigned: true,
        nullable: false,
        comment: '勝者のスコア',
    })
    winnerScore!: number;

    @Column({
        name: 'loser_score',
        type: 'integer',
        unsigned: true,
        nullable: false,
        comment: '敗者のスコア',
    }
    )
    loserScore: number;
  
    @Column({
        name: "created_at",
        type: "timestamp", 
        default: () => "CURRENT_TIMESTAMP" 
    })
    createdAt: Date;
  
    @Column({
        name: "loser_id",
        type: "integer",
        unsigned: true,
        nullable: false,
        comment: "敗者ID"
    })
    loserId: number;
  
    @Column({
        name: "winner_id",
        type: "integer",
        unsigned: true,
        nullable: false,
        comment: "勝者ID"
    })
    winnerId: number;
  
    @ManyToOne(() => User, user => user.gameRecordsAsLoser)
    @JoinColumn({ name: "loserId" })
    loser: User;
  
    @ManyToOne(() => User, user => user.gameRecordsAsWinner)
    @JoinColumn({ name: "winnerId" })
    winner: User;
  }
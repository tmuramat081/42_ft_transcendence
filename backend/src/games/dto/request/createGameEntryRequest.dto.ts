import { DB_INT_MAX, DB_INT_MIN } from '@/common/constant/validator.constant';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

// ゲーム参加者登録API リクエスト
export class CreateGameEntryRequestDto {
  @ApiProperty({ example: 1, required: true, description: 'ユーザーID' })
  @IsNotEmpty()
  @IsInt()
  @Min(DB_INT_MIN)
  @Max(DB_INT_MAX)
  readonly userId!: number;

  @ApiProperty({ example: 'ニックネーム', required: true, description: 'プレーヤー名' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  readonly playerName!: string;

  @ApiProperty({ example: false, required: true, description: '管理者フラグ' })
  @IsOptional()
  @IsBoolean()
  readonly administratorFlag = false;
}

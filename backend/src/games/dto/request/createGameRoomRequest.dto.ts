import { DB_INT_MAX, DB_INT_MIN } from '@/common/constant/validator.constant';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

// ゲームルーム登録APIリクエスト型
export class CreateGameRoomRequestDto {
  @ApiProperty({ example: 1, required: true, description: '登録者ID' })
  @IsNotEmpty()
  @IsInt()
  @Min(DB_INT_MIN)
  @Max(DB_INT_MAX)
  readonly createUserId: number;

  @ApiProperty({ example: 'ルーム1', required: true, description: 'ルーム名' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  readonly roomName: string;

  @ApiProperty({ example: '備考', required: false, description: '備考' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  readonly note: string;

  @ApiProperty({ example: 2, required: false, description: '最大プレーヤー数' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  readonly maxPlayers: number = 2;

  @ApiProperty({ example: 'ニックネーム', required: false, description: 'プレイヤー名' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  readonly playerName: string;
}

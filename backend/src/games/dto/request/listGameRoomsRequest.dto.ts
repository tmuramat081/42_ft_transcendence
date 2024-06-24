import { IsString } from 'class-validator';
import { Valueof } from '@/common/types/global';
import { GAME_ROOM_STATUS } from '../../game.constant';
import { IsOptional, MinLength, MaxLength, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransformToNumber } from '@/common/decorator/transformToNumber.decorator';

// ゲームルーム一覧取得APIリクエスト型
export class ListGameRoomsRequestDto {
  @ApiProperty({ example: '', required: false, description: 'ゲームルーム名' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  readonly 'room-name'?: string;

  @ApiProperty({
    example: GAME_ROOM_STATUS.FINISHED,
    required: false,
    description: 'ルーム状態',
  })
  @IsOptional()
  @IsString()
  @IsEnum(GAME_ROOM_STATUS)
  readonly 'room-status'?: Valueof<typeof GAME_ROOM_STATUS>;

  @ApiProperty({ example: 1, required: false, description: 'ページ番号' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @TransformToNumber()
  readonly 'page-number'?: number = 1;

  @ApiProperty({ example: 3, required: false, description: '取得件数' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @TransformToNumber()
  readonly 'take-count'?: number = 10;
}

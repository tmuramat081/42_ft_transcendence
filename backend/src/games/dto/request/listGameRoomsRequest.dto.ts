import { IsString } from 'class-validator';
import { Valueof } from '@/common/types/global';
import { GAME_ROOM_STATUS } from '../../game.constant';
import {
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { TransformToNumber } from '@/common/decorator/transformToNumber.decorator';

export class ListGameRoomsRequestDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  readonly 'room-name'?: string;

  @IsOptional()
  @IsString()
  @IsEnum(GAME_ROOM_STATUS)
  readonly 'room-status'?: Valueof<typeof GAME_ROOM_STATUS>;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @TransformToNumber()
  readonly 'page-number'?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @TransformToNumber()
  readonly 'take-count'?: number = 10;
}

import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetUserStatusByIdtDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
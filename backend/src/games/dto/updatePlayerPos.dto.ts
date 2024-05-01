import { IsNotEmpty, IsNumber } from 'class-validator';

// 上下位置を更新するためのDTO
export class UpdatePlayerPosDto {
    @IsNumber()
    @IsNotEmpty()
    move: number;
}
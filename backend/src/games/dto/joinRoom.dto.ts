import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class JoinRoomDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;
    
    // @IsNumber()
    // @IsNotEmpty()
    // roomId: number;

    // 別名
    @IsString()
    @IsNotEmpty()
    ariasName: string;

    // 回戦
    @IsNumber()
    @IsNotEmpty()
    round: number;
}
    
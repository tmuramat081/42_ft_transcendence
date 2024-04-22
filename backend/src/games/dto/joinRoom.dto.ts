import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class JoinRoomDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;
    
    // @IsNumber()
    // @IsNotEmpty()
    // roomId: number;

    @IsString()
    @IsNotEmpty()
    aliasName: string;

    @IsNumber()
    @IsNotEmpty()
    round: number;
}
    
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class JoinRoomDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;
    
    // @IsNumber()
    // @IsNotEmpty()
    // roomId: number;
}
    
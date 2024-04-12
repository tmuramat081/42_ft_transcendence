import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { DiffucultyLevel } from '../types/game';

export class PlayGameDto {
    @IsString()
    @IsNotEmpty()
    difficulty: DiffucultyLevel;
    
    @IsNumber()
    @IsNotEmpty()
    matchPoints: number;

    @IsNumber()
    @IsNotEmpty()
    player1Score: number;

    @IsNumber()
    @IsNotEmpty()
    player2Score: number;
}
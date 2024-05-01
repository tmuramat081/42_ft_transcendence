/* eslint-disable */

// request

import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
  IsBoolean,
  IsOptional,
  ValidateIf,
} from 'class-validator';

// このクラスは、ゲームの結果を作成するためのデータ転送オブジェクト（DTO)
export class CreateGameRecordDto {
    @IsNumber()
    @IsNotEmpty()
    winnerScore: number;
    
    @IsNumber()
    @IsNotEmpty()
    loserScore: number;
    
    @IsNumber()
    @IsNotEmpty()
    loserId: number;
    
    @IsNumber()
    @IsNotEmpty()
    winnerId: number;
}
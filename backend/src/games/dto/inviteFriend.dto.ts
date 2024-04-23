import { IsNotEmpty, IsNumber } from 'class-validator';

export class InviteFriendDto {
  @IsNumber()
  @IsNotEmpty()
  guestId: number;

  @IsNumber()
  @IsNotEmpty()
  hostId: number;
}
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateWaitingListDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public url: string;
}

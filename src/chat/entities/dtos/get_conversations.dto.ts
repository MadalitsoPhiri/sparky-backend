import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class GetMessgesDto {
  @IsNotEmpty()
  @IsString()
  public id: string;
}

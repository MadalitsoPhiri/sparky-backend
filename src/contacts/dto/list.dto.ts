import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ListContactDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsArray()
  public contacts: string[];
}

export class UpdateListContactDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsArray()
  public contacts: string[];
}

import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteDto {
  @IsNotEmpty()
  @IsString()
  public file_name: string;
}

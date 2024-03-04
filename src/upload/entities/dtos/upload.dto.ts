import { IsNotEmpty, IsString } from 'class-validator';

export class UploadDto {
  @IsNotEmpty()
  @IsString()
  public file_name: string;

  @IsNotEmpty()
  @IsString()
  public file: Uint8Array;
}

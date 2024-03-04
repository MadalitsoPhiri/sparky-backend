import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class ConfigDto {
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  public data: string;
}

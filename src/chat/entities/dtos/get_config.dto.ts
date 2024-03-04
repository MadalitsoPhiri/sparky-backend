import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class GetConfigDto {
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  public widget_id: string;
}

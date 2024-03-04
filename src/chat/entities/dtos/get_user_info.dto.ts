import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class GetUserInfoDto {
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  public id: string;
}

import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class DeleteFaqDto {
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  public id: string;
}

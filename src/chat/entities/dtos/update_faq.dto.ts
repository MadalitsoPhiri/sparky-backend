import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class UpdateFaqDto {
  @IsNotEmpty()
  @IsString()
  public question: string;

  @IsNotEmpty()
  @IsString()
  public answer: string;

  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  public id: string;
}

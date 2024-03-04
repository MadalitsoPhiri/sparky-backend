import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateFaqDto {
  @IsNotEmpty()
  @IsString()
  public question: string;

  @IsNotEmpty()
  @IsString()
  public answer: string;

  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  public widget_id: string;
}

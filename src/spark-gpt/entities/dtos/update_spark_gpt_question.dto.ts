import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class UpdateSparkGPTQuestionDto {
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  public id: string;

  @IsNotEmpty()
  @IsString()
  public title?: string;

  @IsNotEmpty()
  @IsString()
  public answer?: string;
}

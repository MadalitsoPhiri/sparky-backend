import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateSparkGPTQuestionDto {
  @IsNotEmpty()
  @IsString()
  public title: string;

  @IsNotEmpty()
  @IsString()
  public answer: string;

  @IsNotEmpty()
  @IsBoolean()
  public is_deletable: boolean;
}

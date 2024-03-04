import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class DeleteSparkGPTQuestionDto {
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  public id: string;
}

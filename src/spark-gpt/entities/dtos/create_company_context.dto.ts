import { IsArray, IsNotEmpty } from 'class-validator';
import { BasicSparkGPTQuestion, SparkGPTQuestion } from '../schema';

export class CreateCompanyContextDto {
  @IsNotEmpty()
  @IsArray()
  public sparkGPTQuestionList: SparkGPTQuestion[] | BasicSparkGPTQuestion[];
}

import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class FullCompanyDataFromRawDataDto {
  @IsNotEmpty()
  @IsString()
  public company_context: string;

  @IsNotEmpty()
  @IsArray()
  public conversation_starters: string[];

  @IsNotEmpty()
  @IsArray()
  public prompt_suggestions: string[];
}

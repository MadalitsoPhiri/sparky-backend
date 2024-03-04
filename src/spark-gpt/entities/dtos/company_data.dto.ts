import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CompanyDataDto {
  @IsNotEmpty()
  @IsString()
  public context: string;

  @IsNotEmpty()
  @IsArray()
  public conversationStarterList: string[];

  @IsNotEmpty()
  @IsArray()
  public promptSuggestionList: string[];

  @IsString()
  public color: string;

  @IsString()
  public favicon: string;
}

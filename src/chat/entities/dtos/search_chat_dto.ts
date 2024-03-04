import { IsString, IsNotEmpty } from 'class-validator';

export class SearchChatDto {
  @IsNotEmpty()
  @IsString()
  public term: string;
}

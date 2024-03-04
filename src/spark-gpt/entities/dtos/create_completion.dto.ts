import { IsNotEmpty, IsString } from 'class-validator';

export type ChatHistoryMessageRole = 'user' | 'assistant';

export class ChatHistoryMessageDto {
  @IsNotEmpty()
  @IsString()
  public role: ChatHistoryMessageRole;

  @IsNotEmpty()
  @IsString()
  public content: string;
}

export class CreateCompletionDto {
  @IsNotEmpty()
  @IsString()
  public companyName: string;

  @IsNotEmpty()
  @IsString()
  public companyContext: string;

  @IsNotEmpty()
  @IsString()
  public chatHistory: ChatHistoryMessageDto[];
}

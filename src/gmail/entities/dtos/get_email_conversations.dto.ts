import { IsNotEmpty, IsString } from 'class-validator';

export class GetEmailConversationDetilsDto {
  @IsNotEmpty()
  @IsString()
  public thread_id: string;
}

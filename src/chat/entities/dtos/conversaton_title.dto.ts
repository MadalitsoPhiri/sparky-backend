import { IsNotEmpty } from 'class-validator';
import { Content } from '../schema';

export class UpdateConversationTitleDto {
  @IsNotEmpty()
  public title: string;
  public conversation_id: string;
}

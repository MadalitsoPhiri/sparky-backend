import { IsNotEmpty } from 'class-validator';
import { CONVERSATION_STATUS } from '../constants';
import { Content } from '../schema';

export class UpdateConversationStatusDto {
  @IsNotEmpty()
  public conversation_id: string;
  public status: CONVERSATION_STATUS;
}

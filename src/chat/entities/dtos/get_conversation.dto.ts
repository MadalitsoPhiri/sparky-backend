import { CONVERSATION_CHANNEL, CONVERSATION_STATUS } from '../constants';
import { Conversations } from '../schema';

export class GetConversationDto {
  public page: number;
  public size: number;
  public lastConversation: Conversations;
  public sort: -1 | 1;
  public status?: CONVERSATION_STATUS;
  public contactId?: string;
  public channel?: CONVERSATION_CHANNEL;
}

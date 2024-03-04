import { IsNotEmpty } from 'class-validator';
import { Messages } from '../schema';
import { CONVERSATION_CHANNEL } from '../constants';

export class CreateConversationDto {
  @IsNotEmpty()
  public message: Messages;

  @IsNotEmpty()
  public conversation_channel: CONVERSATION_CHANNEL;
}

import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { CONVERSATION_CHANNEL } from '../constants';

export class ContactConversationsDto {
  @IsNotEmpty()
  @IsMongoId()
  @IsString()
  public contact_id: string;

  @IsNotEmpty()
  @IsString()
  public conversation_channel: CONVERSATION_CHANNEL;
}

import { IsMongoId, IsNotEmpty } from 'class-validator';
import { CONVERSATION_CHANNEL } from '../constants';
import { Users } from 'src/auth/entities';

export class CreateConversationWithoutMessageDto {
  @IsMongoId()
  @IsNotEmpty()
  public workspace_id: string;

  @IsMongoId()
  @IsNotEmpty()
  public contact_id: string;

  @IsNotEmpty()
  public conversation_channel: CONVERSATION_CHANNEL;

  @IsMongoId()
  @IsNotEmpty()
  public user?: Users;
}

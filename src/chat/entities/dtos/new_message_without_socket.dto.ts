import { IsArray, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Attachments } from '../schema';
import { CONVERSATION_CHANNEL } from '../constants';
import { USER_PROPERTIES } from 'src/auth/entities';

export class NewMessageWithoutSocketDto {
  @IsNotEmpty()
  @IsString()
  public text: string;

  @IsNotEmpty()
  @IsString()
  public conversation_channel: CONVERSATION_CHANNEL;

  @IsNotEmpty()
  @IsString()
  public sender_identifier: USER_PROPERTIES;

  @IsNotEmpty()
  public sender_identifier_value: any;

  @IsNotEmpty()
  @IsString()
  public receiver_identifier: USER_PROPERTIES;

  @IsNotEmpty()
  public receiver_identifier_value: any;

  @IsArray()
  public attachments?: Attachments[];

  @IsMongoId()
  @IsString()
  public workspace_id?: string;
}

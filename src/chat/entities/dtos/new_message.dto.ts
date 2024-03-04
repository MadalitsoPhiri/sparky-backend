import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsString,
} from 'class-validator';
import { Attachments, Messages } from '../schema';
import { CONVERSATION_CHANNEL } from '../constants';

export class NewMessageDto {
  @IsNotEmpty()
  @IsMongoId()
  @IsString()
  public conversation_id: string;

  @IsNotEmpty()
  @IsString()
  public text: string;

  @IsNotEmpty()
  @IsString()
  public conversation_channel: CONVERSATION_CHANNEL;

  @IsMongoId()
  @IsString()
  public contact_id?: string;

  @IsMongoId()
  @IsString()
  public workspace_id?: string;

  @IsArray()
  public attachments?: Attachments[];
  @IsObject()
  public msg: Messages;
}

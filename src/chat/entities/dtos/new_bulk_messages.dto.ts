import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsString,
} from 'class-validator';
import { Attachments } from '../schema';
import { CONVERSATION_CHANNEL } from '../constants';

export class NewBulkMessagesDto {
  @IsNotEmpty()
  @IsArray()
  public contact_id_list: string[];

  @IsNotEmpty()
  @IsString()
  public text: string;

  @IsNotEmpty()
  @IsString()
  public conversation_channel: CONVERSATION_CHANNEL;

  @IsArray()
  public attachments?: Attachments[];
}

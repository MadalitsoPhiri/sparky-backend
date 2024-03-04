import { IsObject } from 'class-validator';
import { Messages } from '../schema';

export class ReadReceiptsDto {
  @IsObject()
  public messages: Messages[];
}

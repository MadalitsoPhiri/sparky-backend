import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class GetMessagesDto {
  @IsNotEmpty()
  @IsMongoId()
  @IsString()
  public conversation_id: string;
  @IsNumber()
  public page: number;
  @IsNumber()
  public size: number;
  @IsNumber()
  public sort: -1 | 1;
}

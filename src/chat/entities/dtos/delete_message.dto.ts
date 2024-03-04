import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class DeleteMessageDto {
  @IsNotEmpty()
  @IsMongoId()
  @IsString()
  public message_id: string;
}

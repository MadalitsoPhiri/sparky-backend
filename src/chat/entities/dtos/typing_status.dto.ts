import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class TypingStatusDto {
  @IsNotEmpty()
  public status: boolean;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  public conversation_id: string;
}

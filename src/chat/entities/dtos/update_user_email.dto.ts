import { IsString, IsNotEmpty } from 'class-validator';
import { FilterQuery } from 'mongoose';
import { Users } from 'src/auth/entities';

export class UpdateUserEmailDto {
  @IsNotEmpty()
  public conversation_id: string;

  @IsNotEmpty()
  public workspace_id: string;

  @IsNotEmpty()
  public message_id: string;

  @IsNotEmpty()
  @IsString()
  public user: FilterQuery<Users>;
}

import { IsString, IsNotEmpty } from 'class-validator';
import { FilterQuery } from 'mongoose';
import { Users } from 'src/auth/entities';

export class UpdateUserInfoDto {
  @IsNotEmpty()
  public id: string;

  @IsNotEmpty()
  @IsString()
  public user: FilterQuery<Users>;
}

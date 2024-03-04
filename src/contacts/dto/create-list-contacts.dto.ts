import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateListContactsDto {
  @Prop()
  @IsString()
  @IsNotEmpty()
  public contact: string;
}

export class AssignContactsDto {
  @IsString()
  @IsNotEmpty()
  public contactId: string;

  @IsString()
  @IsNotEmpty()
  public userId: string;
}

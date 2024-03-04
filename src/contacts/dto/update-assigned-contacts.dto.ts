import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAssignedContactsDto {
  @Prop()
  @IsString()
  @IsNotEmpty()
  public contact: any;
}

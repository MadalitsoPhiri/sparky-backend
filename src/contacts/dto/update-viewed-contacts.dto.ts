import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateViewedContactsDto {
  @Prop()
  @IsString()
  @IsNotEmpty()
  public contact: any;
}

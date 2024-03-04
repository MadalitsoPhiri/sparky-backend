import { Prop } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateAssignedContactsDto {
  @Prop()
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) =>
    value ? value.toString().toLowerCase() : undefined,
  )
  public email: string;

  @Prop()
  @IsString()
  @IsNotEmpty()
  public contact: any[];
}

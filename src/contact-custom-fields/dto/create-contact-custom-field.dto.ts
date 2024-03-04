import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCustomFieldContactDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsNotEmpty()
  contactId: string;

  @IsString()
  @IsNotEmpty()
  customFieldId: string;
}

export class UpdateContactCustomFieldDto extends PartialType(
  CreateCustomFieldContactDto,
) {}

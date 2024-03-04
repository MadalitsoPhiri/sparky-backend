import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateCustomFieldWithContactDto } from 'src/custom-fields/dto/create-custom-field.dto';
import { CONTACT_TYPE } from '../constants';

export class CreateContactDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) =>
    value ? value.toString().toLowerCase() : undefined,
  )
  public email: string;

  @IsString()
  @IsNotEmpty()
  public user_name: string;

  @IsString()
  @IsNotEmpty()
  public contact_type: CONTACT_TYPE;

  @IsString()
  @IsOptional()
  public phone_number: string;

  @IsString()
  @IsOptional()
  public profile_picture_url: string;

  @IsString()
  @IsOptional()
  public company_name: string;

  @IsString()
  @IsOptional()
  public company_website: string;

  @IsString()
  @IsOptional()
  public company_size: string;

  @IsString()
  @IsOptional()
  public company_industry: string;

  @IsObject()
  @IsOptional()
  public custom_fields: CreateCustomFieldWithContactDto;
}

import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateContactDto {
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) =>
    value ? value.toString().toLowerCase() : undefined,
  )
  public email: string;

  @IsString()
  @IsOptional()
  public user_name: string;

  @IsString()
  @IsOptional()
  public contact_type: string;

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

  @IsBoolean()
  public is_blocked: boolean;
}

import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  public user_name: string;

  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString().toLowerCase())
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  public password: string;

  @IsString()
  @IsNotEmpty()
  public company_name: string;

  @IsString()
  @IsNotEmpty()
  public company_size: string;
}

export class SignUpWithInviteDto {
  @IsString()
  @IsNotEmpty()
  public user_name: string;

  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString().toLowerCase())
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  public password: string;

  @IsMongoId()
  @IsNotEmpty()
  public invite_id: string;
}

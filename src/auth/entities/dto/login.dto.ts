import { Optional } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString().toLowerCase())
  public email: string;

  @Optional()
  @IsString()
  public password: string;
}

export class SocialLoginDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString().toLowerCase())
  public email: string;

  @Optional()
  @IsString()
  public type: string;
}

import { IsString, IsNotEmpty, IsMongoId, IsEmail } from 'class-validator';

export class TempSignUp {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  public widget_id: string;
}

export class ForgotPassword {
  @IsString()
  @IsEmail()
  public email: string;
}

export class PasswordReset {
  @IsString()
  public password: string;
  @IsString()
  public token: string;
}

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConnectTwilioCredsDto {
  @IsNotEmpty()
  @IsString()
  public accountSid: string;
  @IsNotEmpty()
  @IsString()
  public authToken: string;
  @IsNotEmpty()
  @IsString()
  public phoneNumber: string;
  @IsNotEmpty()
  @IsString()
  public phoneNumberSid: string;
  @IsOptional()
  public integrationId: string;
}

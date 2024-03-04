import { IsArray, IsString } from 'class-validator';

export class InviteTeamMatesDto {
  @IsArray()
  public emails: string[];
}

export class ResendInviteTeamMateDto {
  @IsString()
  public email: string;
}

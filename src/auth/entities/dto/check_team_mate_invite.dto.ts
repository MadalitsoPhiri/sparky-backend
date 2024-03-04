import { IsString } from 'class-validator';

export class CheckInviteTeamMatesDto {
  @IsString()
  public invite_id: string;
}
export class DeleteTeamMatesDto {
  @IsString()
  public userId: string;
}

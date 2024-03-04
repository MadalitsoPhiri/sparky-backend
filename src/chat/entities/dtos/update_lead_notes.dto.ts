import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLeadNotesDto {
  @IsNotEmpty()
  @IsString()
  public id: string;

  @IsNotEmpty()
  @IsString()
  public note: string;
}

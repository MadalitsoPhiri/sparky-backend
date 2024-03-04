import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateLeadNoteDto {
  @IsNotEmpty()
  @IsString()
  public lead_id: string;

  @IsNotEmpty()
  @IsString()
  public note: string;
}

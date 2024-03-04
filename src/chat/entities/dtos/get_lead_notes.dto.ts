import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class GetLeadNotesDto {
  @IsNotEmpty()
  @IsString()
  public id: string;
}

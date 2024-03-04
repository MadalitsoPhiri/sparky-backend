import { IsNotEmpty, IsObject } from 'class-validator';

export class GetAllActivityLogDto {
  @IsObject()
  @IsNotEmpty()
  public contactId: string;
}

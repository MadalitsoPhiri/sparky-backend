import { IsMongoId, IsNotEmpty } from 'class-validator';

export class DeleteWorkSpaceDto {
  @IsNotEmpty()
  @IsMongoId()
  public id: string;
}

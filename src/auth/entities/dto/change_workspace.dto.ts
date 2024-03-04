import { IsNotEmpty, IsObject } from 'class-validator';
import { WorkSpaces } from '../schema';

export class ChangeWorkSpaceDto {
  @IsObject()
  @IsNotEmpty()
  public workspace: WorkSpaces;
}

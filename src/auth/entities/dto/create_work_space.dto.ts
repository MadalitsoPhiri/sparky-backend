import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

export class WorkSpaceDto {
  @IsString()
  @IsNotEmpty()
  public company_size: string;

  @IsString()
  @IsNotEmpty()
  public workspace_name: string;
}

export class UpdateWorkSpaceDto extends PartialType(WorkSpaceDto) {
  @IsString()
  @IsNotEmpty()
  public timezone: string;
}

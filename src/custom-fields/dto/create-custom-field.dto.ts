import { IsArray, IsString } from 'class-validator';

export class CreateCustomFieldWithContactDto {
  @IsString()
  public value: string;

  @IsString()
  public field: string;
}

export class CreateCustomFieldDto {
  @IsString()
  public field: string;

  @IsString()
  public type: string;

  @IsArray()
  public metaData: any[];
}

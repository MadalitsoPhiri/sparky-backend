import { IsNotEmpty, IsString } from 'class-validator';

export class WebSiteImportDto {
  @IsNotEmpty()
  @IsString()
  public url: string;
}

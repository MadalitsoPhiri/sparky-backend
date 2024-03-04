import { IsNotEmpty, IsString } from 'class-validator';

export class ScraperDto {
  @IsNotEmpty()
  @IsString()
  public url: string;
}

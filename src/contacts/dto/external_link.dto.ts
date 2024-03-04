import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateExternalLinkDto {
  @IsUrl()
  @IsNotEmpty()
  public link: string;

  @IsNotEmpty()
  public userId: string;
}

export class UpdateExternalLinkDtoDto {
  @IsUrl()
  @IsNotEmpty()
  public link: string;
}

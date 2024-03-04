import { IsArray } from 'class-validator';

export class EmailVerificationDto {
  @IsArray()
  public code: string;
}

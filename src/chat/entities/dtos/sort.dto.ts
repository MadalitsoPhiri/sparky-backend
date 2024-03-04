import { IsNotEmpty } from 'class-validator';

export class SortDto {
  @IsNotEmpty()
  public updatedAt: -1 | 1;
}

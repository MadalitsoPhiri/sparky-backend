import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class EventDto<T> {
  @IsObject()
  public data: T;

  @IsNotEmpty()
  @IsString()
  public event_name: string;
}

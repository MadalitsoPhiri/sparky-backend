import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class EventDto<T = undefined> {
  @IsObject()
  public payload?: T;

  @IsNotEmpty()
  @IsString()
  public event_name: string;
}

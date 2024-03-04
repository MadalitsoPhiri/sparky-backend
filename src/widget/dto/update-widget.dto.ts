import { PartialType } from '@nestjs/mapped-types';
import { AdvertWidgetDto } from './advertisement.dto';

export class UpdateWidgetDto extends PartialType(AdvertWidgetDto) {

}

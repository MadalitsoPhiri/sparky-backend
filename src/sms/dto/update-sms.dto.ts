import { PartialType } from '@nestjs/mapped-types';
import { SendSmsDto } from './send-sms.dto';

export class UpdateSmsDto extends PartialType(SendSmsDto) {
  id: number;
}

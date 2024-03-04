import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

export enum TASK_ACTION {
  ASSIGN = 'assign',
  UNASSIGN = 'unassign',
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  id: string;
  action: TASK_ACTION;
}

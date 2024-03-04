import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TASK_STATUS } from '../types';

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  public userId: string;

  @IsNotEmpty()
  @IsString()
  public title: string;

  @IsOptional()
  public description: string;

  @IsOptional()
  public assignedUserId?: string;

  @IsOptional()
  @IsEnum(TASK_STATUS, {
    message: `Status must be one of these values: ${Object.values(
      TASK_STATUS,
    ).join(', ')}`,
  })
  public status: TASK_STATUS;

  @IsOptional()
  @IsEnum(TaskPriority, {})
  public priority: TaskPriority;

  @IsNotEmpty()
  @IsString()
  public dueDate;
}

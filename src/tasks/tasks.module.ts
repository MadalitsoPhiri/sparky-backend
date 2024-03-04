import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLogsRepository } from 'src/activity-logs/activity-logs.repository';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import {
  ActivityLog,
  ActivityLogSchema,
} from 'src/activity-logs/entities/activity-log.entity';
import { Users, usersSchema } from 'src/auth/entities';
import {
  Counter,
  CounterSchema,
} from 'src/auth/entities/schema/counter.schema';
import { UserRepository } from 'src/auth/repositories';
import { List, ListSchema } from 'src/contacts/entities/list.entity';
import { Task, TaskSchema } from './entities/task.entity';
import { TasksGateway } from './tasks.gateway';
import { TaskRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Task.name,
        schema: TaskSchema,
      },
      {
        name: ActivityLog.name,
        schema: ActivityLogSchema,
      },
      {
        name: Users.name,
        schema: usersSchema,
      },
      {
        name: Counter.name,
        schema: CounterSchema,
      },
      {
        name: List.name,
        schema: ListSchema,
      },
    ]),
  ],
  providers: [
    TasksGateway,
    TasksService,
    TaskRepository,
    UserRepository,
    ActivityLogsRepository,
    ActivityLogsService,
  ],
})
export class TasksModule {}

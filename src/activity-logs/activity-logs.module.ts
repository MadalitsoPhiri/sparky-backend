import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, usersSchema } from 'src/auth/entities';
import { ActivityLogsGateway } from './activity-logs.gateway';
import { ActivityLogsRepository } from './activity-logs.repository';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLog, ActivityLogSchema } from './entities/activity-log.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ActivityLog.name,
        schema: ActivityLogSchema,
      },
      {
        name: Users.name,
        schema: usersSchema,
      },
    ]),
  ],
  providers: [ActivityLogsGateway, ActivityLogsService, ActivityLogsRepository],
})
export class ActivityLogsModule {}

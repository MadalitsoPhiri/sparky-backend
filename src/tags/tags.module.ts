import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLogsRepository } from 'src/activity-logs/activity-logs.repository';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import {
  ActivityLog,
  ActivityLogSchema,
} from 'src/activity-logs/entities/activity-log.entity';
import { Tag, TagsSchema } from './entities/tag.entity';
import { TagsGateway } from './tags.gateway';
import { TagRepository } from './tags.repository';
import { TagsService } from './tags.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Tag.name,
        schema: TagsSchema,
      },
      {
        name: ActivityLog.name,
        schema: ActivityLogSchema,
      },
    ]),
  ],
  providers: [
    TagsGateway,
    TagsService,
    TagRepository,
    ActivityLogsService,
    ActivityLogsRepository,
  ],
})
export class TagsModule {}

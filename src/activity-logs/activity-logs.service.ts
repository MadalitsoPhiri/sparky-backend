import { Injectable, Logger } from '@nestjs/common';
import mongoose, { AnyKeys, AnyObject } from 'mongoose';
import { EventDto } from 'src/app/entities/dtos/event.dto';
import { SocketType } from 'src/auth/entities/types';
import { RedisService } from 'src/redis/redis.service';
import { ActivityLogsRepository } from './activity-logs.repository';
import { GetAllActivityLogDto } from './dto/get-all-activity-log.dto';
import { ActivityLog } from './entities/activity-log.entity';

@Injectable()
export class ActivityLogsService {
  private readonly logger: Logger;
  constructor(
    private readonly activityLogsRepository: ActivityLogsRepository,
    private readonly redisService: RedisService,
  ) {
    this.logger = new Logger(ActivityLogsService.name);
  }

  async findAll(payload: EventDto<GetAllActivityLogDto>, client: SocketType) {
    try {
      const active_workspace = await this.redisService.get_active_workspace(
        client.user,
      );
      let contactActivityLogs = [];
      if (payload?.data?.contactId) {
        contactActivityLogs = await this.activityLogsRepository.get_all(
          {
            workspace: new mongoose.Types.ObjectId(active_workspace),
            contact: new mongoose.Types.ObjectId(payload.data.contactId),
          },
          undefined,
          {
            sort: {
              createdAt: -1,
            },
          },
        );
      } else if (active_workspace) {
        contactActivityLogs = await this.activityLogsRepository.get_all(
          {
            workspace: new mongoose.Types.ObjectId(active_workspace),
          },
          undefined,
          {
            sort: {
              createdAt: -1,
            },
            limit: 6,
          },
        );
      }

      return {
        data: contactActivityLogs,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        data: null,
        error: "Couldn't get activity logs",
      };
    }
  }

  async saveActivityLog(
    payload: AnyObject | AnyKeys<ActivityLog>,
    client: SocketType,
  ) {
    const active_workspace = await this.redisService.get_active_workspace(
      client.user,
    );
    this.activityLogsRepository
      .create({
        ...payload,
        created_by: new mongoose.Types.ObjectId(client.user.sub),
        workspace: new mongoose.Types.ObjectId(active_workspace),
      })
      .then((data) => {
        return data.populate('created_by', 'user_name');
      })
      .then((data) => {
        client.emit('new_activity_log', {
          data,
          error: null,
        });
      })
      .catch(() => {
        client.emit('new_activity_log', {
          data: null,
          error: 'Could not create activity log',
        });
      });
  }
}

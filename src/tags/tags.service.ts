import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import {
  ActivityLogAction,
  ActivityLogType,
} from 'src/activity-logs/entities/activity-log.entity';
import { EventDto } from 'src/app/entities/dtos/event.dto';
import { SocketType } from 'src/auth/entities/types';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagRepository } from './tags.repository';

@Injectable()
export class TagsService {
  constructor(
    private readonly tagRepository: TagRepository,
    private readonly activityLogService: ActivityLogsService,
  ) {}
  async create(payload: EventDto<CreateTagDto>, client: SocketType) {
    try {
      const newTag = await this.tagRepository.create({
        name: payload.data.name,
        user_id: payload.data.userId,
        created_by: new mongoose.Types.ObjectId(client.user.sub),
      });

      await this.activityLogService.saveActivityLog(
        {
          contact: new mongoose.Types.ObjectId(payload.data.userId),
          action: ActivityLogAction.CREATED,
          type: ActivityLogType.TAG,
          content: `<strong class="text-gray-600 uppercase">${ActivityLogAction.CREATED}</strong> a ${ActivityLogType.TAG} with title: "${payload.data.name}"`,
        },
        client,
      );
      return {
        data: newTag,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to create tag',
      };
    }
  }

  async findAll(
    payload: EventDto<{
      userId: string;
    }>,
  ) {
    const all_user_tags = await this.tagRepository.get_all({
      user_id: payload.data.userId,
    });
    return {
      data: all_user_tags,
      error: null,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} tag`;
  }

  async update(payload: EventDto<UpdateTagDto>, client: SocketType) {
    try {
      const updatedTag = await this.tagRepository.update_one_by_id(
        payload.data.id,
        payload.data,
      );

      await this.activityLogService.saveActivityLog(
        {
          contact: new mongoose.Types.ObjectId(payload.data.userId),
          action: ActivityLogAction.UPDATED,
          type: ActivityLogType.TAG,
          content: `<strong class="text-gray-600 uppercase">${ActivityLogAction.UPDATED}</strong> a ${ActivityLogType.TAG} with title: "${updatedTag.name}"`,
        },
        client,
      );

      return {
        data: updatedTag,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to create tag',
      };
    }
  }

  async remove(id: string, client: SocketType) {
    try {
      const deletedTag = await this.tagRepository.delete_by_id(id);

      await this.activityLogService.saveActivityLog(
        {
          contact: new mongoose.Types.ObjectId(deletedTag.user_id),
          action: ActivityLogAction.DELETED,
          type: ActivityLogType.TAG,
          content: `<strong class="text-gray-600 uppercase">${ActivityLogAction.DELETED}</strong> a ${ActivityLogType.TAG} with title: "${deletedTag.name}"`,
        },
        client,
      );
      return {
        data: deletedTag,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to delete tag',
      };
    }
  }
}

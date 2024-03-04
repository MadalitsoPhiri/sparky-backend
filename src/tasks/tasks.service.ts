import { HttpException, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import {
  ActivityLogAction,
  ActivityLogType,
} from 'src/activity-logs/entities/activity-log.entity';
import { Users } from 'src/auth/entities';
import { SocketType } from 'src/auth/entities/types';
import { UserRepository } from 'src/auth/repositories';
import { RedisService } from 'src/redis/redis.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TASK_ACTION, UpdateTaskDto } from './dto/update-task.dto';
import { TaskRepository } from './tasks.repository';
import { TASK_FILTER, TASK_STATUS } from './types';

@Injectable()
export class TasksService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
    private readonly activityLogService: ActivityLogsService,
  ) {}

  async create(createTaskDto: CreateTaskDto, client: SocketType) {
    try {
      await this.checkIfUserExists(createTaskDto.userId);
      const active_workspace = await this.redisService.get_active_workspace(
        client.user,
      );
      const assignedUser = await this.checkAssignedUser(
        createTaskDto?.assignedUserId,
      );
      delete createTaskDto?.assignedUserId;
      const newTask = await this.taskRepository.create({
        ...createTaskDto,
        assignedUser,
        workspaceId: active_workspace,
      });
      this.activityLogService.saveActivityLog(
        {
          contact: new mongoose.Types.ObjectId(createTaskDto.userId),
          action: ActivityLogAction.CREATED,
          type: ActivityLogType.TASK,
          content: `<strong class="text-gray-600 uppercase">${ActivityLogAction.CREATED}</strong> a ${ActivityLogType.TASK} with title: "${createTaskDto.title}" and priority: "${createTaskDto.priority}"`,
        },
        client,
      );
      return {
        data: newTask,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error.message,
      };
    }
  }

  async findAll(client: SocketType, contactId: string, filter: TASK_FILTER) {
    const contact = await this.userRepository.check_exists({
      id: new mongoose.Types.ObjectId(contactId),
    });
    const active_workspace = await this.redisService.get_active_workspace(
      client.user,
    );

    let filters = {};

    if (contactId) {
      if (!contact) {
        throw new HttpException('Contact not found', 404);
      }
      filters = {
        userId: contactId,
      };
    } else if (active_workspace) {
      filters = {
        workspaceId: active_workspace,
      };
    }

    switch (filter) {
      case TASK_FILTER.COMPLETED:
        filters['status'] = TASK_STATUS.DONE;
        break;
      case TASK_FILTER.DUE_TODAY:
        filters['dueDate'] = new Date().toISOString().split('T')[0];
        break;
      case TASK_FILTER.OVER_DUE:
        filters['$or'] = [
          { dueDate: { $lt: new Date().toISOString() } },
          { status: TASK_STATUS.OVER_DUE },
        ];
        break;
      case TASK_FILTER.UP_COMING:
        filters['dueDate'] = { $gt: new Date().toISOString() };
        break;
      default:
        break;
    }

    const tasks = await this.taskRepository.get_all(filters, undefined, {
      sort: {
        createdAt: -1,
      },
    });

    return tasks;
  }

  async findOne(id: string) {
    return await this.taskRepository.get_by_id(id);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, client: SocketType) {
    try {
      await this.checkIfTaskExists(id);
      const assignedUser = await this.checkAssignedUser(
        updateTaskDto.assignedUserId,
      );
      const payload = {
        ...updateTaskDto,
      };

      if (updateTaskDto.action === TASK_ACTION.ASSIGN) {
        payload['assignedUser'] = assignedUser;
      }

      if (updateTaskDto.action === TASK_ACTION.UNASSIGN) {
        payload['assignedUser'] = null;
      }

      const updatedTask = await this.taskRepository.update_one_by_id(
        id,
        payload,
      );

      this.activityLogService.saveActivityLog(
        {
          contact: new mongoose.Types.ObjectId(updatedTask.userId),
          action: ActivityLogAction.UPDATED,
          type: ActivityLogType.TASK,
          content: `<strong class="text-gray-600 uppercase">${ActivityLogAction.UPDATED}</strong> a ${ActivityLogType.TASK} with title: "${updatedTask.title}" and priority: "${updatedTask.priority}"`,
        },
        client,
      );

      return {
        data: updatedTask,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error.message,
      };
    }
  }

  async remove(id: string, client: SocketType) {
    try {
      const deletedTask = await this.taskRepository.delete_by_id(id);
      this.activityLogService.saveActivityLog(
        {
          contact: new mongoose.Types.ObjectId(deletedTask.userId),
          action: ActivityLogAction.DELETED,
          type: ActivityLogType.TASK,
          content: `<strong class="text-gray-600 uppercase">${ActivityLogAction.DELETED}</strong> a ${ActivityLogType.TASK} with title: "${deletedTask.title}" and priority: "${deletedTask.priority}"`,
        },
        client,
      );

      return {
        data: deletedTask,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error.message,
      };
    }
  }

  async checkAssignedUser(assignedId: string) {
    let assignedUser: Users | null;

    if (assignedId) {
      assignedUser = await this.userRepository.get_by_id(assignedId);
      if (!assignedUser) {
        throw new HttpException('Assigned user not found', 404);
      }
    }

    return assignedUser;
  }

  async checkIfTaskExists(taskId: string) {
    const task = await this.taskRepository.get_by_id(taskId);
    if (!task) {
      throw new HttpException('Task not found', 404);
    }
    return task;
  }

  async checkIfUserExists(userId: string) {
    const task = await this.userRepository.get_by_id(userId);
    if (!task) {
      throw new HttpException('Task not found', 404);
    }
    return task;
  }
}

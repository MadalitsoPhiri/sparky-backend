import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { EventDto } from 'src/app/entities/dtos/event.dto';
import { SocketAuthGuard } from 'src/auth/entities/guard';
import { SocketType } from 'src/auth/entities/types';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { TASK_FILTER } from './types';

@WebSocketGateway()
export class TasksGateway {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('create_task')
  create(
    @ConnectedSocket() client: SocketType,
    @MessageBody() payload: EventDto<CreateTaskDto>,
  ) {
    return this.tasksService.create(payload.data, client);
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('get_tasks')
  findAll(
    @ConnectedSocket() client: SocketType,
    @MessageBody() payload: EventDto<{ userId: string; filter: TASK_FILTER }>,
  ) {
    return this.tasksService.findAll(
      client,
      payload.data.userId,
      payload.data.filter,
    );
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('get_task')
  findOne(@MessageBody() payload: EventDto<{ id: string }>) {
    return this.tasksService.findOne(payload.data.id);
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('update_task')
  update(
    @ConnectedSocket() client: SocketType,
    @MessageBody() payload: EventDto<UpdateTaskDto>,
  ) {
    return this.tasksService.update(payload.data.id, payload.data, client);
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('delete_task')
  remove(
    @ConnectedSocket() client: SocketType,
    @MessageBody() payload: EventDto<{ id: string }>,
  ) {
    return this.tasksService.remove(payload.data.id, client);
  }
}

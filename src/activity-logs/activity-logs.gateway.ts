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
import { ActivityLogsService } from './activity-logs.service';
import { GetAllActivityLogDto } from './dto/get-all-activity-log.dto';

@WebSocketGateway()
export class ActivityLogsGateway {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('get_activity_logs')
  findAll(
    @MessageBody() data: EventDto<GetAllActivityLogDto>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.activityLogsService.findAll(data, client);
  }
}

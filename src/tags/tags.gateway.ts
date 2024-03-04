import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { EventDto } from 'src/app/entities/dtos/event.dto';
import { SocketType } from 'src/auth/entities/types';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsService } from './tags.service';

@WebSocketGateway()
export class TagsGateway {
  constructor(private readonly tagsService: TagsService) {}

  @SubscribeMessage('create_tag')
  create(
    @MessageBody() createTagDto: EventDto<CreateTagDto>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.tagsService.create(createTagDto, client);
  }

  @SubscribeMessage('get_tags')
  findAll(@MessageBody() data: EventDto<any>) {
    return this.tagsService.findAll(data);
  }

  @SubscribeMessage('findOneTag')
  findOne(@MessageBody() id: number) {
    return this.tagsService.findOne(id);
  }

  @SubscribeMessage('updateTag')
  update(
    @MessageBody() updateTagDto: EventDto<UpdateTagDto>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.tagsService.update(updateTagDto, client);
  }

  @SubscribeMessage('delete_tag')
  remove(
    @MessageBody() payload: EventDto<{ id: string }>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.tagsService.remove(payload.data.id, client);
  }
}

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { EventDto } from 'src/app/entities/dtos/event.dto';
import { SocketType } from 'src/auth/entities/types';
import {
  AdvertWidgetDto,
  UpdateAdvertWidgetDto,
} from '../dto/advertisement.dto';
import { AdvertService } from '../services/advert.service';

@WebSocketGateway()
export class AdvertGateway {
  constructor(private readonly advert_service: AdvertService) {}

  @SubscribeMessage('create_advert')
  async handleCreateAdvert(
    @ConnectedSocket() client: SocketType,
    @MessageBody() payload: EventDto<AdvertWidgetDto>,
  ) {
    return await this.advert_service.createAdvert(payload.data, client);
  }

  @SubscribeMessage('get_adverts')
  handleGetAllAdvert(@ConnectedSocket() client: SocketType) {
    return this.advert_service.findAllAdverts(client);
  }

  @SubscribeMessage('get_advert')
  handleGetAdvert(@ConnectedSocket() client: SocketType) {
    return this.advert_service.findAdvert(client);
  }

  @SubscribeMessage('remove_advert')
  handleRemoveAdvert(@MessageBody() payload: EventDto<AdvertWidgetDto>) {
    return this.advert_service.removeAdvert(payload);
  }

  @SubscribeMessage('edit_advert')
  handleEditSurvey(@MessageBody() payload: EventDto<UpdateAdvertWidgetDto>) {
    return this.advert_service.update(payload.data);
  }
}

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { EventDto } from 'src/app/entities/dtos/event.dto';
import { SocketType } from 'src/auth/entities/types';
import { ContactsService } from './contacts.service';
import {
  AssignContactsDto,
  CreateListContactsDto,
} from './dto/create-list-contacts.dto';
import { CreateExternalLinkDto } from './dto/external_link.dto';
import { ExternalLinkService } from './services/external_link.service';

@WebSocketGateway()
export class ContactGateway {
  constructor(
    private readonly contactService: ContactsService,
    private readonly externalLinkService: ExternalLinkService,
  ) {}

  @SubscribeMessage('create_recently_viewed_contacts')
  async handleRecentlyView(
    @ConnectedSocket() client: SocketType,
    @MessageBody() payload: EventDto<CreateListContactsDto>,
  ) {
    return await this.contactService.createViewedContact(client, payload.data);
  }

  @SubscribeMessage('create_my_contacts')
  async handleMyContact(
    @ConnectedSocket() client: SocketType,
    @MessageBody() payload: EventDto<CreateListContactsDto>,
  ) {
    return await this.contactService.createMyContact(client, payload.data);
  }

  @SubscribeMessage('assign_contact')
  async handleAssignContact(
    @ConnectedSocket() client: SocketType,
    @MessageBody() payload: EventDto<AssignContactsDto>,
  ) {
    return await this.contactService.createAssignContact(client, payload.data);
  }

  @SubscribeMessage('create_user_external_link')
  async handleCreateExternalLink(
    @MessageBody() payload: EventDto<CreateExternalLinkDto>,
  ) {
    return await this.externalLinkService.create(payload.data);
  }

  @SubscribeMessage('get_user_external_links')
  async handleGetUserExternalLinks(
    @MessageBody()
    payload: EventDto<{
      userId: string;
    }>,
  ) {
    return await this.externalLinkService.findAll(payload.data.userId);
  }
}

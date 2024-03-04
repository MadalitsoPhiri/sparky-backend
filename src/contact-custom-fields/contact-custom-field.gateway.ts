import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { EventDto } from 'src/app/entities/dtos/event.dto';
import { CustomFieldsService } from 'src/custom-fields/custom-fields.service';
import { CustomFieldContactService } from './contact-custom-field.service';
import { CreateCustomFieldContactDto } from './dto/create-contact-custom-field.dto';

@WebSocketGateway()
export class ContactCustomFieldGateway {
  constructor(
    private readonly custom_field_contact_service: CustomFieldContactService,
    private readonly custom_field_service: CustomFieldsService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('update_custom_field_value')
  async handleCreateAdvert(
    @MessageBody() payload: EventDto<CreateCustomFieldContactDto>,
  ) {
    const customField = await this.custom_field_service.findOneById(
      payload.data.customFieldId,
    );

    if (!customField?.id) {
      return {
        error: 'Custom field not found',
        data: null,
      };
    }

    const _payload = {
      ...payload.data,
      customFieldId: customField.id,
    };

    const updatedValue = await this.custom_field_contact_service.update(
      _payload,
    );

    return {
      error: null,
      data: updatedValue,
    };
  }

  @SubscribeMessage('get_custom_field_by_contact_id')
  async handleGetCustomFieldByContactId(
    @MessageBody() payload: EventDto<{ contactId: string }>,
  ) {
    return await this.custom_field_contact_service.getByContactId(
      payload.data.contactId,
    );
  }
}

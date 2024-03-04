import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { EventDto } from 'src/app/entities/dtos/event.dto';
import { SocketType } from 'src/auth/entities/types';
import { SurveyWidgetDto, UpdateSurveyWidgetDto } from '../dto/survey.dto';
import { SurveyService } from '../services/survey.service';

@WebSocketGateway()
export class SurveyGateway {
  constructor(private readonly survey_service: SurveyService) {}

  @SubscribeMessage('create_survey')
  async handleCreateAdvert(
    @ConnectedSocket() client: SocketType,
    @MessageBody() payload: EventDto<SurveyWidgetDto>,
  ) {
    return await this.survey_service.create(payload.data, client);
  }

  @SubscribeMessage('get_surveys')
  handleGetAllAdvert(@ConnectedSocket() client: SocketType) {
    return this.survey_service.findAll(client);
  }

  @SubscribeMessage('get_survey')
  handleGetAdvert(@MessageBody() payload: EventDto<{ id: string }>) {
    return this.survey_service.find(payload.data.id);
  }

  @SubscribeMessage('remove_survey')
  handleRemoveAdvert(@MessageBody() payload: EventDto<{ id: string }>) {
    return this.survey_service.remove(payload.data.id);
  }

  @SubscribeMessage('set_active_survey')
  handleActiveSurvey(@MessageBody() payload: EventDto<UpdateSurveyWidgetDto>) {
    return this.survey_service.set_active(payload.data);
  }

  @SubscribeMessage('edit_survey')
  handleEditSurvey(@MessageBody() payload: EventDto<UpdateSurveyWidgetDto>) {
    return this.survey_service.update(payload.data);
  }
}

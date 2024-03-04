import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { EventDto } from 'src/app/entities/dtos/event.dto';
import { SocketAuthGuard } from 'src/auth/entities/guard';
import { SocketType } from 'src/auth/entities/types';
import { ConnectGoogleIntegrationDto } from './dto/connect_google_integration.dto';
import { IntegrationsService } from './integrations.service';

@WebSocketGateway()
export class IntegrationsGateWay {
  constructor(private readonly integrationsService: IntegrationsService) {}
  @WebSocketServer()
  server: Server;

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('connect_google_integration')
  handleAgentMessage(
    @MessageBody() data: EventDto<ConnectGoogleIntegrationDto>,
    @ConnectedSocket() client: SocketType,
  ) {
    return this.integrationsService.connectGoogleIntegration(client, data.data);
  }
}

import { Body, Controller, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { SmsService } from './sms.service';
import { ChatService } from 'src/chat/chat.service';
import { CONVERSATION_CHANNEL } from 'src/chat/entities/constants';
import { USER_PROPERTIES } from 'src/auth/entities';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SmsGateway } from './sms.gateway';

@Controller('sms')
@WebSocketGateway()
export class SmsController {
  constructor(
    private readonly sms_service: SmsService,
    private chat_service: ChatService,
    private sms_gateway: SmsGateway,
  ) {}
  @WebSocketServer()
  server: Server;

  // all incoming messages will be sent to this endpoint by twilio
  @Post()
  webhook(
    @Query() query: { workspaceId: string },
    @Body() body: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const smsData = {
        conversation_channel: CONVERSATION_CHANNEL.SMS,
        text: body.Body,
        sender_identifier: USER_PROPERTIES.PHONE_NUMBER,
        sender_identifier_value: body.From,
        receiver_identifier: USER_PROPERTIES.PHONE_NUMBER,
        receiver_identifier_value: body.To,
        workspace_id: query?.workspaceId,
      };

      // TODO: Handle media within sms

      this.chat_service.handle_new_message_without_socket_connection(
        smsData,
        this.sms_gateway.server,
      );
    } catch (error) {
      // TODO: Handle Error in accordance with what we want Twilio to do
    }

    // TODO: Check if the message was sent
  }

  @Post('status-callback')
  statusCallback(
    @Body() createSmsDto: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    // https://www.twilio.com/docs/usage/webhooks/sms-webhooks#:~:text=Your%20Twilio%20phone%20numbers%20can,called%20webhooks%2C%20or%20status%20callbacks.
    // TODO: Add logic to send the message to the dashboard if status was not sent or if there was an error and update the message status
  }
}

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { SocketType } from 'src/auth/entities/types';
import { GmailService } from './gmail.service';
import { SocketPayloadInterface } from './entities/dtos/socket_payload.interface';
import { EmailOptions } from 'src/email/entities/types/email_options';
import { EmailGetAttachmentPayload } from './entities/dtos/email_get_attachment_payload.interface';

@WebSocketGateway()
export class GmailGateway {
  constructor(private gmailService: GmailService) {}

  @SubscribeMessage('get_email_conversations')
  async handleGetEmailConversations(
    @ConnectedSocket() client: SocketType,
    @MessageBody() payload: SocketPayloadInterface,
  ) {
    const { nextPageToken } = payload.data;

    const threadList = await this.gmailService.get_gmail_threads(
      client,
      nextPageToken,
    );

    const detailedThreadList = await this.gmailService.get_thread_details(
      client,
      threadList.threads,
    );

    threadList.threads = detailedThreadList;

    return threadList;
  }

  @SubscribeMessage('get_recent_email_list')
  async handleGetRecentEmailList(
    @ConnectedSocket() client: SocketType,
    @MessageBody() payload: SocketPayloadInterface,
  ) {
    let { historyId } = payload.data;

    const threadList = await this.gmailService.get_recent_gmail_threads(
      client,
      historyId,
    );

    const detailedThreadList = await this.gmailService.get_thread_details(
      client,
      threadList.threads,
    );

    threadList.threads = detailedThreadList;

    if (detailedThreadList[0]?.historyId) {
      historyId = detailedThreadList[0]?.historyId;
      threadList.historyId = historyId;
    }

    return threadList;
  }

  @SubscribeMessage('send_email')
  async handleSendEmail(
    @MessageBody() payload: EmailOptions,
    @ConnectedSocket() client: SocketType,
  ) {
    const response = await this.gmailService.send_email(client, payload);
    return { data: response };
  }

  @SubscribeMessage('get_attachment')
  async handleGetAttachment(
    @MessageBody() payload: EmailGetAttachmentPayload,
    @ConnectedSocket() client: SocketType,
  ) {
    const response = await this.gmailService.get_attachment(
      client,
      payload.data.messageId,
      payload.data.attachmentId,
    );
    return { data: response };
  }

  @SubscribeMessage('delete_email')
  async handleDeleteEmail(
    @MessageBody() payload: SocketPayloadInterface,
    @ConnectedSocket() client: SocketType,
  ) {
    const { messageId } = payload.data;
    const response = await this.gmailService.delete_gmail_message(
      client,
      messageId,
    );
    return { data: response };
  }
}

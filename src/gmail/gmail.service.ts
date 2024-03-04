import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodeMailer from 'nodemailer';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { EmailOptions } from 'src/email/entities/types/email_options';
import { RedisService } from 'src/redis/redis.service';
import { SocketType } from 'src/auth/entities/types';
import { IntegrationCredentialRepository } from 'src/integrations/integration_credential.repository';
import axios from 'axios';
import {
  GMAIL_THREAD_DETAILS_ENDPOINT,
  GMAIL_THREAD_END_POINT,
  GMAIL_ATTACHMENT_END_POINT,
  GMAIL_DELETE_MESSAGE_ENDPOINT,
} from './entities/constants';
import { ThreadListInterface } from './entities/dtos/email_thread_list.interface';
import { EmailThreadResponseInterface } from './entities/dtos/email_thread_detail_response.interface';
import { EmailAttachmentResponse } from './entities/dtos/email_attachment_response.interface';
import { EmailAttachment } from 'src/email/entities/types/attachments.interface';
import { EmailPayloadPartsInterface } from './entities/dtos/email_payload_parts.interface';

@Injectable()
export class GmailService {
  private oAuth2Client: OAuth2Client;
  constructor(
    private config: ConfigService,
    private redisService: RedisService,
    private integrationCredentialRepository: IntegrationCredentialRepository,
  ) {
    this.oAuth2Client = new google.auth.OAuth2(
      this.config.get('CLIENT_ID'),
      this.config.get('CLIENT_SECRET'),
      this.config.get('REDIRECT_URI'),
    );
  }

  async generateTransporter(email: string, refresh_token: string) {
    this.oAuth2Client.setCredentials({ refresh_token });
    const access_token = await this.oAuth2Client.getAccessToken();
    return nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: email,
        clientId: this.config.get('CLIENT_ID'),
        clientSecret: this.config.get('CLIENT_SECRET'),
        refreshToken: refresh_token,
        accessToken: access_token as string,
      },
    });
  }

  async send_email(client: SocketType, options: EmailOptions) {
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );

    const result: any = await this.integrationCredentialRepository.get_one({
      workspaceId: session.active_workspace,
    });

    const transporter = await this.generateTransporter(
      result.credentials.email,
      result.credentials.refreshToken,
    );

    const { data } = options;

    const mailOptions = {
      from: result.email,
      to: data.to,
      subject: data.subject,
      text: data.text,
      attachments: data.attachments?.map((attachment: EmailAttachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        encoding: attachment.encoding || 'base64',
      })),
      inReplyTo: data?.inReplyTo,
      references: data?.references,
    };

    return await transporter.sendMail(mailOptions);
  }

  async get_gmail_threads(client: SocketType, nextPageToken: string) {
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );

    const result = await this.integrationCredentialRepository.get_one({
      workspaceId: session.active_workspace,
    });

    this.oAuth2Client.setCredentials({
      refresh_token: result.credentials.refreshToken,
    });

    const token_response = await this.oAuth2Client.getAccessToken();

    let pageToken = nextPageToken || null;

    const thread_response: any = await axios.get(
      GMAIL_THREAD_END_POINT(result.credentials.email),
      {
        headers: {
          Authorization: `Bearer ${token_response.token}`,
        },
        params: {
          pageToken: pageToken,
          maxResults: 10,
        },
      },
    );

    if (thread_response.data.nextPageToken) {
      pageToken = thread_response.data.nextPageToken;
    } else {
      pageToken = null;
    }

    const historyId = Math.max(
      ...thread_response.data.threads.map((thread) => thread.historyId),
    ).toString();

    return {
      ...thread_response.data,
      userEmail: result.credentials.email,
      historyId,
    };
  }

  async get_recent_gmail_threads(client: SocketType, historyId: string) {
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );

    const result = await this.integrationCredentialRepository.get_one({
      workspaceId: session.active_workspace,
    });

    this.oAuth2Client.setCredentials({
      refresh_token: result.credentials.refreshToken,
    });

    const token_response = await this.oAuth2Client.getAccessToken();

    const thread_response: any = await axios.get(
      GMAIL_THREAD_END_POINT(result.credentials.email),
      {
        headers: {
          Authorization: `Bearer ${token_response.token}`,
        },
        params: {
          maxResults: 10,
        },
      },
    );

    const recentThreads = thread_response.data.threads.filter(
      (thread) => thread.historyId > historyId,
    );

    const filteredThreadsData = {
      ...thread_response.data,
      threads: recentThreads,
    };

    return {
      ...filteredThreadsData,
      userEmail: result.credentials.email,
      historyId,
    };
  }

  async get_thread_details(
    client: SocketType,
    threadList: ThreadListInterface[],
  ): Promise<EmailThreadResponseInterface[]> {
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );

    const { credentials } = await this.integrationCredentialRepository.get_one({
      workspaceId: session.active_workspace,
    });

    this.oAuth2Client.setCredentials({
      refresh_token: credentials.refreshToken,
    });

    const { token } = await this.oAuth2Client.getAccessToken();

    const getThreadDetails = async (
      threadId: string,
    ): Promise<EmailThreadResponseInterface> => {
      const response = await axios.get(
        GMAIL_THREAD_DETAILS_ENDPOINT(credentials.email, threadId),
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return response.data;
    };

    const flattenPartList = (partList: EmailPayloadPartsInterface[]) => {
      const flattenedPartList = [];

      partList.forEach((part) => {
        if (part?.parts?.length > 0) {
          flattenedPartList.push(...flattenPartList(part?.parts));
          return;
        }

        flattenedPartList.push(part);
      });

      return flattenedPartList;
    };

    const threadDetails = await Promise.all(
      threadList.map(async (thread) => {
        return await getThreadDetails(thread.id);
      }),
    );

    const filteredThreadDetails = threadDetails
      .map((threadInList) => {
        const filteredMessages = threadInList?.messages?.filter?.(
          (messageInList) =>
            !messageInList?.payload?.headers?.some?.((headerInList) => {
              return headerInList?.value?.includes?.('Fwd:');
            }),
        );

        const messageListWithFilteredParts = filteredMessages.map((message) => {
          const flattenedParts = flattenPartList([message?.payload]);

          const filteredParts = flattenedParts.filter((part) => {
            return (
              !part?.mimeType?.includes?.('text') ||
              !part?.mimeType?.includes?.('plain') ||
              !flattenedParts?.some?.((siblingPart) =>
                siblingPart?.mimeType?.includes?.('html'),
              )
            );
          });

          return {
            ...message,
            parts: filteredParts,
            payload: { ...message.payload, undefined },
          };
        });

        return { ...threadInList, messages: messageListWithFilteredParts };
      })
      .filter((threadInList) => threadInList?.messages?.length > 0);

    return filteredThreadDetails;
  }

  async get_attachment(
    client: SocketType,
    messageId: string,
    attachmentId: string,
  ): Promise<string> {
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );

    const { credentials } = await this.integrationCredentialRepository.get_one({
      workspaceId: session.active_workspace,
    });

    this.oAuth2Client.setCredentials({
      refresh_token: credentials.refreshToken,
    });

    const { token } = await this.oAuth2Client.getAccessToken();

    const attachmentResponse: EmailAttachmentResponse = await axios.get(
      GMAIL_ATTACHMENT_END_POINT(credentials.email, messageId, attachmentId),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return attachmentResponse.data.data;
  }

  async delete_gmail_message(
    client: SocketType,
    messageId: string,
  ): Promise<boolean> {
    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );

    const result = await this.integrationCredentialRepository.get_one({
      workspaceId: session.active_workspace,
    });

    this.oAuth2Client.setCredentials({
      refresh_token: result.credentials.refreshToken,
    });

    const token_response = await this.oAuth2Client.getAccessToken();

    await axios.delete(
      GMAIL_DELETE_MESSAGE_ENDPOINT(result.credentials.email, messageId),
      {
        headers: {
          Authorization: `Bearer ${token_response.token}`,
        },
      },
    );
    return true;
  }
}

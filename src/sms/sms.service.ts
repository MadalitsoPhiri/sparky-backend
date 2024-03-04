import { Injectable, Logger } from '@nestjs/common';
import { SocketType } from 'src/auth/entities/types';
import { EventDto } from 'src/app/entities/dtos/event.dto';
import { RedisService } from 'src/redis/redis.service';
import * as twilio from 'twilio';
import { SendSmsDto } from './dto/send-sms.dto';
import { ConnectTwilioCredsDto } from './dto/connect-twillio-creds.dto';
import { ConfigService } from '@nestjs/config';
import { IntegrationCredentialRepository } from 'src/integrations/integration_credential.repository';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { RejectedSmsDto } from './dto/rejected-sms.dto';

@Injectable()
export class SmsService {
  public twilioClient: twilio.Twilio;
  public twiml: twilio.twiml.MessagingResponse;

  constructor(
    private integrationCredentialRepository: IntegrationCredentialRepository,
    private redisService: RedisService,
    private config: ConfigService,
  ) {
    this.twiml = new twilio.twiml.MessagingResponse();
  }

  async getTwilio(accountSid: string, authToken: string) {
    return new twilio.Twilio(accountSid, authToken);
  }

  async sendSms(payload: EventDto<SendSmsDto>, client: SocketType) {
    const resolved: MessageInstance[] = [];
    const rejected: RejectedSmsDto[] = [];

    const session = await this.redisService.get_session(
      client.user.sub,
      client.user.session_id,
    );
    const twilioCreds: any = await this.integrationCredentialRepository.get_one(
      {
        name: {
          $eq: 'twilio',
        },
        workspaceId: session.active_workspace,
      },
    );
    this.twilioClient = await this.getTwilio(
      twilioCreds.credentials.accountSid,
      twilioCreds.credentials.authToken,
    );

    for (const to of payload.data.to) {
      try {
        const result = await this.twilioClient.messages.create({
          body: payload.data.body,
          from: twilioCreds?.credentials?.phoneNumber,
          to,
        });
        resolved.push(result);
      } catch (error) {
        rejected.push({ to, error });
      }
    }

    return { resolved, rejected };
  }

  findAll() {
    return `This action returns all sms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sm`;
  }

  remove(id: number) {
    return `This action removes a #${id} sm`;
  }

  async updateTwilioSmsUrl(
    connectTwilioCreds: ConnectTwilioCredsDto,
    workspaceId: string,
  ) {
    try {
      this.twilioClient = await this.getTwilio(
        connectTwilioCreds.accountSid,
        connectTwilioCreds.authToken,
      );

      return await this.twilioClient
        .incomingPhoneNumbers(connectTwilioCreds.phoneNumberSid)
        .update({
          smsUrl:
            this.config.get('VITE_API_BASE_URL') +
            '/api/sms' +
            `?workspaceId=${workspaceId}`,
        });
    } catch (error) {
      Logger.log(error);
      return {
        data: null,
        error: error.message,
      };
    }
  }
}

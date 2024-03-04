import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import mongoose from 'mongoose';
import JwtPayload from 'src/auth/entities/types/jwt.payload';
import { WorkspaceRepository } from 'src/auth/repositories';
import { RedisService } from 'src/redis/redis.service';

import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SocketType } from 'src/auth/entities/types';
import { ERROR_MESSAGES } from 'src/error-handling/constants';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';
import { ConnectTwilioCredsDto } from 'src/sms/dto/connect-twillio-creds.dto';
import { SmsService } from 'src/sms/sms.service';
import { ConnectGoogleIntegrationDto } from './dto/connect_google_integration.dto';
import {
  GOOGLE_PROFILE_ENDPOINT_URL,
  GOOGLE_TOKEN_ENDPOINT_URL,
  INTEGRATION_NAMES,
  getRefreshTokenParams,
  getTokenParams,
} from './entities/constants';
import { Integration } from './entities/integration.entity';
import { IntegrationCredentialRepository } from './integration_credential.repository';
import { integrationSeed } from './integrations-data/data';
import { IntegrationRepository } from './integrations.repository';

@Injectable()
export class IntegrationsService implements OnModuleInit {
  constructor(
    private integrationRepository: IntegrationRepository,
    private integrationCredentialRepository: IntegrationCredentialRepository,
    private workspace_repository: WorkspaceRepository,
    private redisService: RedisService,
    private smsService: SmsService,
    private error_handling_service: ErrorHandlingService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      await Promise.all(
        integrationSeed.map(async (integration: Integration) => {
          await this.integrationRepository.upsert(integration);
        }),
      );
    } catch (error) {
      throw error;
    }
  }

  async connectTwilio(
    integration: Integration,
    connectTwilioCreds: ConnectTwilioCredsDto,
    userJwt: JwtPayload,
  ) {
    const activeWorkspace = await this.getActiveWorkspace(userJwt);

    if (
      !connectTwilioCreds.phoneNumber ||
      !connectTwilioCreds.accountSid ||
      !connectTwilioCreds.authToken ||
      !connectTwilioCreds.phoneNumberSid
    ) {
      this.error_handling_service.emitErrorEventToDashboard(
        activeWorkspace,
        ERROR_MESSAGES.MISSING_DATA,
      );

      throw new HttpException(
        'all fields are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const twilio_integration = await this.integrationRepository.get_by_id(
      connectTwilioCreds.integrationId,
    );

    if (!twilio_integration) {
      this.error_handling_service.emitErrorEventToDashboard(
        activeWorkspace,
        ERROR_MESSAGES.SMS_INTEGRATION_NOT_FOUND,
      );

      throw new HttpException(
        ERROR_MESSAGES.SMS_INTEGRATION_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const currentWorkspace = await this.workspace_repository.get_by_id(
      activeWorkspace,
    );

    // check if integration already exists
    const integrationExists = currentWorkspace.integrations.find(
      (i) =>
        i._id &&
        (i._id.toString() === integration._id.toString() ||
          i.name.toLowerCase() === 'twilio'),
    );

    if (integrationExists) {
      this.error_handling_service.emitErrorEventToDashboard(
        activeWorkspace,
        ERROR_MESSAGES.SMS_INTEGRATION_ALREADY_EXISTS,
      );

      throw new HttpException(
        ERROR_MESSAGES.SMS_INTEGRATION_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedSmsWebHookUrl = await this.smsService.updateTwilioSmsUrl(
      connectTwilioCreds,
      currentWorkspace._id,
    );

    if ((updatedSmsWebHookUrl as any)?.error) {
      this.error_handling_service.emitErrorEventToDashboard(
        activeWorkspace,
        (updatedSmsWebHookUrl as any)?.error.message,
      );

      throw new HttpException(
        (updatedSmsWebHookUrl as any)?.error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.integrationCredentialRepository.create({
      type: 'twilio',
      workspaceId: activeWorkspace,
      credentials: {
        phoneNumber: connectTwilioCreds.phoneNumber,
        accountSid: connectTwilioCreds.accountSid,
        authToken: connectTwilioCreds.authToken,
      },
    });

    const updatedWorkspace = await this.workspace_repository.update_one(
      {
        _id: new mongoose.Types.ObjectId(activeWorkspace).toString(),
      },
      {
        $addToSet: {
          integrations: integration,
        },
      },
    );

    return updatedWorkspace;
  }

  async getTwilioCredentials(userJwt: JwtPayload) {
    const activeWorkspace = await this.getActiveWorkspace(userJwt);
    return await this.integrationCredentialRepository.get_one({
      workspace: activeWorkspace,
    });
  }

  async createIntegration(
    integrationData: ConnectTwilioCredsDto | { [key: string]: any },
    userJwt: JwtPayload,
  ) {
    const integration = await this.integrationRepository.get_by_id(
      integrationData.integrationId,
    );

    if (!integration) {
      throw new HttpException('integration not found', HttpStatus.NOT_FOUND);
    }

    switch (integration.name) {
      case INTEGRATION_NAMES.TWILIO:
        return this.connectTwilio(
          integration,
          integrationData as ConnectTwilioCredsDto,
          userJwt,
        );
      case INTEGRATION_NAMES.OUTLOOK:
        break;

      case INTEGRATION_NAMES.GOOGLE:
        break;

      default:
        break;
    }
  }

  async findAll() {
    return this.integrationRepository.get_all({});
  }

  async getActiveWorkspace(user: JwtPayload) {
    const session = await this.redisService.get_session(
      user.sub,
      user.session_id,
    );
    return session.active_workspace;
  }
  async refreshGoogleAccessToken(refreshToken: string, config: ConfigService) {
    const response: any = await axios.post(
      GOOGLE_TOKEN_ENDPOINT_URL,
      getRefreshTokenParams(refreshToken, config),
    );
    return response.data.access_token;
  }
  async connectGoogleIntegration(
    client: SocketType,
    data: ConnectGoogleIntegrationDto,
  ) {
    try {
      if (data?.code) {
        const response: any = await axios.post(
          GOOGLE_TOKEN_ENDPOINT_URL,
          getTokenParams(data?.code, this.config),
        );

        const profile_response: any = await axios.get(
          GOOGLE_PROFILE_ENDPOINT_URL(response.data.access_token),
        );

        const activeWorkspace = await this.getActiveWorkspace(
          client.user as JwtPayload,
        );
        const integration = await this.integrationRepository.get_one({
          name: 'Google',
        });
        if (!integration) {
          throw new HttpException(
            'integration not found',
            HttpStatus.NOT_FOUND,
          );
        }

        await this.integrationCredentialRepository.create({
          type: 'google',
          workspaceId: activeWorkspace,
          credentials: {
            refreshToken: response.data.refresh_token,
            ...profile_response.data,
          },
        });

        await this.workspace_repository.update_one(
          {
            _id: new mongoose.Types.ObjectId(activeWorkspace).toString(),
          },
          {
            $addToSet: {
              integrations: integration,
            },
          },
        );

        return { data: { integration, status: 200 }, error: null };
      }
      return { data: null, error: 'could not connect google integration' };
    } catch (e: any) {
      return { data: null, error: 'could not connect google integration' };
    }
  }
}

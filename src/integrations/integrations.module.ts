import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkSpaces, WorkSpacesSchema } from 'src/auth/entities';
import { WorkspaceRepository } from 'src/auth/repositories';
import { SmsService } from 'src/sms/sms.service';
import { Integration, IntegrationSchema } from './entities/integration.entity';
import { IntegrationsController } from './integrations.controller';
import { IntegrationRepository } from './integrations.repository';
import { IntegrationsService } from './integrations.service';
import { IntegrationCredentialRepository } from './integration_credential.repository';
import {
  IntegrationCredential,
  IntegrationCredentialSchema,
} from './entities/integration_credential.entity';
import { IntegrationsGateWay } from './integrations.gateway';
import { ErrorHandlingGateway } from 'src/error-handling/error-handling.gateway';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      {
        name: Integration.name,
        schema: IntegrationSchema,
      },
      {
        name: WorkSpaces.name,
        schema: WorkSpacesSchema,
      },
      {
        name: IntegrationCredential.name,
        schema: IntegrationCredentialSchema,
      },
    ]),
  ],
  controllers: [IntegrationsController],
  providers: [
    SmsService,
    IntegrationsService,
    IntegrationRepository,
    WorkspaceRepository,
    IntegrationCredentialRepository,
    IntegrationsGateWay,
    ErrorHandlingGateway,
    ErrorHandlingService,
  ],
})
export class IntegrationsModule {}

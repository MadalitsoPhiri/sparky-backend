import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { GmailEmailService } from 'src/app/services/email.service';
import { AuthService } from 'src/auth/auth.service';
import {
  Users,
  WidgetConfig,
  WidgetConfigSchema,
  WorkSpaceDefaults,
  WorkSpaceDefaultsSchema,
  WorkSpacePermissions,
  WorkSpacePermissionsSchema,
  WorkSpaceTeamMates,
  WorkSpaceTeamMatesSchema,
  WorkSpaces,
  WorkSpacesSchema,
  usersSchema,
} from 'src/auth/entities';
import {
  Counter,
  CounterSchema,
} from 'src/auth/entities/schema/counter.schema';
import {
  WorkSpaceTeamMateInvitations,
  WorkSpaceTeamMatesInvitationSchema,
} from 'src/auth/entities/schema/work_space_invitation.schema';
import {
  UserRepository,
  WidgetConfigRepository,
  WorkSpacePermissionsRepository,
  WorkSpaceTeamMatesRepository,
  WorkspaceRepository,
} from 'src/auth/repositories';
import { WorkSpaceDefaultsRepository } from 'src/auth/repositories/workspace_defaults.repository';
import { WorkSpaceInvitationRepository } from 'src/auth/repositories/workspace_teammate_invitations.repository';
import { JwtStrategy } from 'src/auth/strategy';
import { ChatService } from 'src/chat/chat.service';
import {
  Conversations,
  ConversationsSchema,
  FaqSchema,
  Faqs,
  Messages,
  MessagesSchema,
  Notes,
  NotesSchema,
  Tag,
  TagsSchema,
} from 'src/chat/entities/schema';
import { ConversationsRepository } from 'src/chat/repositories/conversation.repository';
import { FaqsRespository } from 'src/chat/repositories/faq.respository';
import { MessagesRepository } from 'src/chat/repositories/message.repository';
import { NotesRepository } from 'src/chat/repositories/notes.repository';
import { List, ListSchema } from 'src/contacts/entities/list.entity';
import { EmailService } from 'src/email/email.service';
import { ConversationsCacheRepository } from 'src/redis/repositories/conversation_cache.repository';
import {
  CompanyContext,
  CompanyContextSchema,
  DefaultSparkGPTQuestion,
  DefaultSparkGPTQuestionSchema,
  SparkGPTQuestion,
  SparkGPTQuestionSchema,
} from 'src/spark-gpt/entities/schema';
import { CompanyContextRepository } from 'src/spark-gpt/repositories/company_context.repository';

import { SmsController } from './sms.controller';

import { ActivityLogsRepository } from 'src/activity-logs/activity-logs.repository';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import {
  ActivityLog,
  ActivityLogSchema,
} from 'src/activity-logs/entities/activity-log.entity';
import { ErrorHandlingGateway } from 'src/error-handling/error-handling.gateway';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';
import {
  Integration,
  IntegrationSchema,
} from 'src/integrations/entities/integration.entity';
import {
  IntegrationCredential,
  IntegrationCredentialSchema,
} from 'src/integrations/entities/integration_credential.entity';
import { IntegrationCredentialRepository } from 'src/integrations/integration_credential.repository';
import { IntegrationRepository } from 'src/integrations/integrations.repository';
import { SmsGateway } from './sms.gateway';
import { SmsService } from './sms.service';
import { SparkGPTService } from 'src/spark-gpt/spark_gpt.service';
import { SparkGPTQuestionRepository } from 'src/spark-gpt/repositories/spark_gpt_question.repository';
import { DefaultSparkGPTQuestionRepository } from 'src/spark-gpt/repositories/default_spark_gpt_question.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ActivityLog.name,
        schema: ActivityLogSchema,
      },
      {
        name: Users.name,
        schema: usersSchema,
      },
      {
        name: CompanyContext.name,
        schema: CompanyContextSchema,
      },
      {
        name: WidgetConfig.name,
        schema: WidgetConfigSchema,
      },
      {
        name: Tag.name,
        schema: TagsSchema,
      },
      {
        name: Conversations.name,
        schema: ConversationsSchema,
      },
      {
        name: Notes.name,
        schema: NotesSchema,
      },
      {
        name: Messages.name,
        schema: MessagesSchema,
      },
      {
        name: WorkSpaces.name,
        schema: WorkSpacesSchema,
      },
      ,
      {
        name: WorkSpacePermissions.name,
        schema: WorkSpacePermissionsSchema,
      },
      {
        name: WorkSpaceTeamMates.name,
        schema: WorkSpaceTeamMatesSchema,
      },
      {
        name: WorkSpaceDefaults.name,
        schema: WorkSpaceDefaultsSchema,
      },
      {
        name: WorkSpaceTeamMateInvitations.name,
        schema: WorkSpaceTeamMatesInvitationSchema,
      },
      {
        name: Faqs.name,
        schema: FaqSchema,
      },
      { name: Counter.name, schema: CounterSchema },
      { name: List.name, schema: ListSchema },
      { name: IntegrationCredential.name, schema: IntegrationCredentialSchema },
      {
        name: Integration.name,
        schema: IntegrationSchema,
      },
      {
        name: DefaultSparkGPTQuestion.name,
        schema: DefaultSparkGPTQuestionSchema,
      },
      {
        name: SparkGPTQuestion.name,
        schema: SparkGPTQuestionSchema,
      },
    ]),
  ],
  controllers: [SmsController],
  providers: [
    SmsService,
    ConfigService,
    ChatService,
    CompanyContextRepository,
    AuthService,
    WidgetConfigRepository,
    ConversationsRepository,
    WorkspaceRepository,
    MessagesRepository,
    ConversationsCacheRepository,
    FaqsRespository,
    NotesRepository,
    JwtStrategy,
    JwtService,
    UserRepository,
    WorkSpacePermissionsRepository,
    WorkSpaceTeamMatesRepository,
    WorkSpaceDefaultsRepository,
    GmailEmailService,
    WorkSpaceInvitationRepository,
    EmailService,
    IntegrationRepository,
    SmsGateway,
    IntegrationCredentialRepository,
    ErrorHandlingService,
    ErrorHandlingGateway,
    ActivityLogsRepository,
    ActivityLogsService,
    SparkGPTService,
    SparkGPTQuestionRepository,
    DefaultSparkGPTQuestionRepository,
  ],
})
export class SmsModule {}

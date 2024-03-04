import { Module } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { GmailGateway } from './gmail.gateway';
import { IntegrationCredentialRepository } from 'src/integrations/integration_credential.repository';
import {
  IntegrationCredential,
  IntegrationCredentialSchema,
} from 'src/integrations/entities/integration_credential.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationsRepository } from 'src/chat/repositories/conversation.repository';
import { Conversations, ConversationsSchema } from 'src/chat/entities/schema';
import { Users, usersSchema } from 'src/auth/entities';
import { ConversationsCacheRepository } from 'src/redis/repositories/conversation_cache.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Users.name,
        schema: usersSchema,
      },
      // {
      //   name: CompanyContext.name,
      //   schema: CompanyContextSchema,
      // },
      // {
      //   name: WidgetConfig.name,
      //   schema: WidgetConfigSchema,
      // },
      // {
      //   name: Tags.name,
      //   schema: TagsSchema,
      // },
      {
        name: Conversations.name,
        schema: ConversationsSchema,
      },
      // {
      //   name: Notes.name,
      //   schema: NotesSchema,
      // },
      // {
      //   name: Messages.name,
      //   schema: MessagesSchema,
      // },
      // {
      //   name: WorkSpaces.name,
      //   schema: WorkSpacesSchema,
      // },
      // {
      //   name: WorkSpacePermissions.name,
      //   schema: WorkSpacePermissionsSchema,
      // },
      // {
      //   name: WorkSpaceTeamMates.name,
      //   schema: WorkSpaceTeamMatesSchema,
      // },
      // {
      //   name: WorkSpaceDefaults.name,
      //   schema: WorkSpaceDefaultsSchema,
      // },
      // {
      //   name: WorkSpaceTeamMateInvitations.name,
      //   schema: WorkSpaceTeamMatesInvitationSchema,
      // },
      // {
      //   name: Faqs.name,
      //   schema: FaqSchema,
      // },
      // { name: Counter.name, schema: CounterSchema },
      // { name: List.name, schema: ListSchema },
      { name: IntegrationCredential.name, schema: IntegrationCredentialSchema },
    ]),
  ],
  providers: [
    GmailService,
    GmailGateway,
    IntegrationCredentialRepository,
    ConversationsRepository,
    ConversationsCacheRepository,
  ],
})
export class GmailModule {}

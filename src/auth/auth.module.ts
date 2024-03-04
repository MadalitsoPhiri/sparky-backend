import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  Users,
  usersSchema,
  WorkSpaceDefaults,
  WorkSpaceDefaultsSchema,
  WorkSpacePermissions,
  WorkSpacePermissionsSchema,
  WorkSpaces,
  WorkSpacesSchema,
  WorkSpaceTeamMates,
  WorkSpaceTeamMatesSchema,
} from './entities';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy';
import { AuthGateWay } from './auth.gateway';
import { WidgetConfig, WidgetConfigSchema } from 'src/auth/entities';
import { ChatModule } from 'src/chat/chat.module';
import { UserRepository } from './repositories/user.repository';
import { WorkspaceRepository } from './repositories/workspace.repository';
import { WorkSpacePermissionsRepository } from './repositories/workspace_permissions.repository.ts';
import { WorkSpaceTeamMatesRepository } from './repositories/workspace_team_mates.repository';
import { WidgetConfigRepository } from './repositories';
import { WorkSpaceDefaultsRepository } from './repositories/workspace_defaults.repository';
import { ConversationsRepository } from 'src/chat/repositories/conversation.repository';
import {
  Conversations,
  ConversationsSchema,
  Messages,
  MessagesSchema,
} from 'src/chat/entities/schema';
import { ConversationsCacheRepository } from 'src/redis/repositories/conversation_cache.repository';
import { MessagesRepository } from 'src/chat/repositories/message.repository';
import { Counter, CounterSchema } from './entities/schema/counter.schema';

import { EmailService } from 'src/email/email.service';
import { WorkSpaceInvitationRepository } from './repositories/workspace_teammate_invitations.repository';
import {
  WorkSpaceTeamMateInvitations,
  WorkSpaceTeamMatesInvitationSchema,
} from './entities/schema/work_space_invitation.schema';
import { List, ListSchema } from 'src/contacts/entities/list.entity';
import { GmailEmailService } from 'src/app/services/email.service';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';
import { ErrorHandlingGateway } from 'src/error-handling/error-handling.gateway';

@Global()
@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      {
        name: Users.name,
        schema: usersSchema,
      },
      {
        name: WidgetConfig.name,
        schema: WidgetConfigSchema,
      },
      {
        name: WorkSpaces.name,
        schema: WorkSpacesSchema,
      },
      {
        name: WorkSpaceTeamMates.name,
        schema: WorkSpaceTeamMatesSchema,
      },
      {
        name: WorkSpacePermissions.name,
        schema: WorkSpacePermissionsSchema,
      },
      { name: WorkSpaceDefaults.name, schema: WorkSpaceDefaultsSchema },
      { name: Conversations.name, schema: ConversationsSchema },
      { name: Messages.name, schema: MessagesSchema },
      { name: Counter.name, schema: CounterSchema },

      {
        name: WorkSpaceTeamMateInvitations.name,
        schema: WorkSpaceTeamMatesInvitationSchema,
      },
      { name: List.name, schema: ListSchema },
    ]),
    ChatModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    AuthGateWay,
    UserRepository,
    WorkspaceRepository,
    WorkSpacePermissionsRepository,
    WorkSpaceTeamMatesRepository,
    WidgetConfigRepository,
    WorkSpaceDefaultsRepository,
    ConversationsRepository,
    ConversationsCacheRepository,
    MessagesRepository,
    GmailEmailService,
    WorkSpaceInvitationRepository,
    EmailService,
    ErrorHandlingService,
    ErrorHandlingGateway,
  ],
  exports: [AuthService],
})
export class AuthModule {}

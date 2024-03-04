import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, usersSchema } from 'src/auth/entities';
import {
  Counter,
  CounterSchema,
} from 'src/auth/entities/schema/counter.schema';
import { UserRepository } from 'src/auth/repositories';
import { Conversations, ConversationsSchema } from 'src/chat/entities/schema';
import { ConversationsRepository } from 'src/chat/repositories/conversation.repository';
import {
  CustomFieldContact,
  CustomFieldContactSchema,
} from 'src/contact-custom-fields/entities/custom-field-contact.entity';
import { CustomFieldContactRepository } from 'src/contact-custom-fields/repository';
import {
  CustomField,
  CustomFieldSchema,
} from 'src/custom-fields/entities/custom-field.entity';
import { CustomFieldsRepository } from 'src/custom-fields/respository';
import { ConversationsCacheRepository } from 'src/redis/repositories/conversation_cache.repository';
import { GmailEmailService } from '../app/services/email.service';
import { ContactsController } from './contacts.controller';
import { ContactGateway } from './contacts.gateway';
import { ContactsService } from './contacts.service';
import {
  AssignedContacts,
  AssignedContactsSchema,
} from './entities/assigned_contacts.schema';
import {
  ExternalLink,
  externalLinkSchema,
} from './entities/external_links.entity';
import { List, ListSchema } from './entities/list.entity';
import { MyContact, MyContactSchema } from './entities/my_contacts.schema';
import {
  ViewedContacts,
  ViewedContactsSchema,
} from './entities/viewed_contacts.schema';
import { WaitingList, WaitingListSchema } from './entities/waiting_list.schema';
import { ListsController } from './lists.controller';
import { AssignedContactsRepository } from './repositories/assigned_contacts.repository';
import { ExternalLinkRepository } from './repositories/external_link.repository';
import { ListRepository } from './repositories/list.repository';
import { MyContactRepository } from './repositories/my_contact.repository';
import { ViewedContactsRepository } from './repositories/viewed_contacts.repository';
import { WaitingListRepository } from './repositories/waiting_list.repository';
import { ExternalLinkService } from './services/external_link.service';
import { ListService } from './services/list.service';

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
        name: WaitingList.name,
        schema: WaitingListSchema,
      },
      {
        name: AssignedContacts.name,
        schema: AssignedContactsSchema,
      },
      {
        name: ViewedContacts.name,
        schema: ViewedContactsSchema,
      },
      {
        name: MyContact.name,
        schema: MyContactSchema,
      },
      {
        name: CustomField.name,
        schema: CustomFieldSchema,
      },
      { name: Counter.name, schema: CounterSchema },
      {
        name: Conversations.name,
        schema: ConversationsSchema,
      },
      {
        name: List.name,
        schema: ListSchema,
      },
      {
        name: CustomFieldContact.name,
        schema: CustomFieldContactSchema,
      },
      {
        name: ExternalLink.name,
        schema: externalLinkSchema,
      },
    ]),
  ],
  controllers: [ContactsController, ListsController],
  providers: [
    ContactGateway,
    ContactsService,
    UserRepository,
    ConversationsRepository,
    ConversationsCacheRepository,
    WaitingListRepository,
    AssignedContactsRepository,
    ViewedContactsRepository,
    MyContactRepository,
    CustomFieldsRepository,
    CustomFieldContactRepository,
    GmailEmailService,
    ListService,
    ListRepository,
    ExternalLinkRepository,
    ExternalLinkService,
  ],
})
export class ContactsModule {}

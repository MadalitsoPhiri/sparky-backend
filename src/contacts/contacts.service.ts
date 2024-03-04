import { Injectable, Logger } from '@nestjs/common';
import mongoose from 'mongoose';
import { SocketType } from 'src/auth/entities/types';
import JwtPayload from 'src/auth/entities/types/jwt.payload';
import { UserRepository } from 'src/auth/repositories';
import { ConversationsRepository } from 'src/chat/repositories/conversation.repository';
import { CustomFieldContactRepository } from 'src/contact-custom-fields/repository';
import { CustomFieldsRepository } from 'src/custom-fields/respository';
import { RedisService } from 'src/redis/redis.service';
import { CONTACT_TYPE } from './constants';
import { ContactsQueryTypes, RequiredContactCSVData } from './contact.types';
import { CreateAssignedContactsDto } from './dto/create-assigned-contacts.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import {
  AssignContactsDto,
  CreateListContactsDto,
} from './dto/create-list-contacts.dto';
import { CreateWaitingListDto } from './dto/create-waiting-list.dto';
import { UpdateAssignedContactsDto } from './dto/update-assigned-contacts.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { WaitingList } from './entities/waiting_list.schema';
import { AssignedContactsRepository } from './repositories/assigned_contacts.repository';
import { ListRepository } from './repositories/list.repository';
import { MyContactRepository } from './repositories/my_contact.repository';
import { ViewedContactsRepository } from './repositories/viewed_contacts.repository';
import { WaitingListRepository } from './repositories/waiting_list.repository';

@Injectable()
export class ContactsService {
  constructor(
    private user_repository: UserRepository,
    private waiting_list_repository: WaitingListRepository,
    private viewedContactRepository: ViewedContactsRepository,
    private myContactRepository: MyContactRepository,
    private assigned_contacts_repository: AssignedContactsRepository,
    private custom_fields_repository: CustomFieldsRepository,
    private redisService: RedisService,
    private conversationsRepository: ConversationsRepository,
    private customFieldContactRepository: CustomFieldContactRepository,
    private listRepository: ListRepository,
  ) {}

  async create(createContactDto: CreateContactDto, userJwt: JwtPayload) {
    const active_workspace = await this.get_active_workspace(userJwt);
    let custom_fields;

    if (
      createContactDto.custom_fields &&
      Object.keys(createContactDto.custom_fields).length > 0
    ) {
      // TODO: // add field validation i.e make sure field type matches with field value

      const found_fields = await this.custom_fields_repository.get_all({
        workspace_id: new mongoose.Types.ObjectId(active_workspace).toString(),
        field: { $in: Object.keys(createContactDto.custom_fields) },
      });

      const map_fields = found_fields.map((field) => ({
        [field.field]: createContactDto.custom_fields[field.field],
      }));

      if (map_fields.length > 0) {
        custom_fields = Object.assign({}, ...map_fields);
      } else {
        custom_fields = null;
      }
    }

    if (createContactDto.user_name) {
      createContactDto.user_name = createContactDto.user_name.trim();
    }

    return this.user_repository.create({
      ...createContactDto,
      workspace: new mongoose.Types.ObjectId(active_workspace),
      custom_fields,
    });
  }

  async findWaitingListByEmail(email: string): Promise<WaitingList | null> {
    return this.waiting_list_repository.findByEmail(email);
  }

  async createWaitingList(createWaitingListDto: CreateWaitingListDto) {
    return this.waiting_list_repository.create({
      ...createWaitingListDto,
    });
  }

  //find all wainting lists
  async findAllWaitingList() {
    return await this.waiting_list_repository.findAll();
  }

  async findAll(
    user: JwtPayload,
    filters: {
      query?: ContactsQueryTypes;
      search: string;
      list: string;
      operator: string;
      key: string;
      value: string;
      contactType?: 'all' | 'my' | 'recently-viewed';
    },
  ) {
    const active_workspace = await this.get_active_workspace(user);

    let contacts = [];
    switch (filters.contactType) {
      case 'all':
        contacts = await this.user_repository.get_all({
          workspace: new mongoose.Types.ObjectId(active_workspace),
          ...filters,
        });
        break;
      case 'my':
        contacts = await this.findMyContacts(user);
        break;
      case 'recently-viewed':
        contacts = await this.findRecentContacts(user, active_workspace);
        break;
      default:
        contacts = await this.user_repository.get_all({
          workspace: new mongoose.Types.ObjectId(active_workspace),
          ...filters,
        });
        break;
    }

    const updatedContactList = await Promise.all(
      contacts.filter(Boolean).map(async (contactInList) => {
        const filter = {
          contact_id: contactInList.id,
        };

        const customFieldContactList =
          await this.customFieldContactRepository.get_all(filter);

        const updatedContact = {
          ...contactInList.toJSON(),
        };

        for await (const customFieldContactInList of customFieldContactList) {
          const customField = await this.custom_fields_repository.get_by_id(
            customFieldContactInList.custom_field_id,
          );

          updatedContact[customField?.field] = customFieldContactInList.value;
        }

        return updatedContact;
      }),
    );

    return updatedContactList;
  }

  findOne(id: string) {
    return this.user_repository.get_by_id(id, 'owner');
  }

  update(id: string, updateContactDto: UpdateContactDto) {
    return this.user_repository.update_one(
      { id: new mongoose.Types.ObjectId(id) },
      updateContactDto,
    );
  }

  //create viewed contact
  async createViewedContact(
    client: SocketType,
    createViewedContactsDto: CreateListContactsDto,
  ) {
    const owner = await this.user_repository.get_by_id(client.user.sub);

    if (!owner) {
      return {
        error: 'User not found',
        data: null,
      };
    }
    const contact = await this.user_repository.get_by_id(
      createViewedContactsDto.contact,
    );

    if (!contact) {
      return {
        error: 'Contact not found',
        data: null,
      };
    }

    const active_workspace = await this.get_active_workspace(
      client.user as JwtPayload,
    );

    const viewedContacts = await this.viewedContactRepository.upsert(
      {
        contact: new mongoose.Types.ObjectId(contact.id),
      },
      {
        $setOnInsert: {
          contact: new mongoose.Types.ObjectId(contact.id),
          viewedBy: new mongoose.Types.ObjectId(owner.id),
          workspace: new mongoose.Types.ObjectId(active_workspace),
        },
      },
    );

    return {
      error: null,
      data: viewedContacts,
    };
  }

  //create viewed contact
  async createMyContact(
    client: SocketType,
    createMyContactDto: CreateListContactsDto,
  ) {
    const owner = await this.user_repository.get_by_id(client.user.sub);

    if (!owner) {
      return {
        error: 'User not found',
        data: null,
      };
    }
    const contact = await this.user_repository.get_by_id(
      createMyContactDto.contact,
    );

    if (!contact) {
      return {
        error: 'Contact not found',
        data: null,
      };
    }

    const active_workspace = await this.get_active_workspace(
      client.user as JwtPayload,
    );

    const myContact = await this.myContactRepository.upsert(
      {
        contact: new mongoose.Types.ObjectId(contact.id),
      },
      {
        $setOnInsert: {
          contact: new mongoose.Types.ObjectId(contact.id),
          ownedBy: new mongoose.Types.ObjectId(owner.id),
          workspace: new mongoose.Types.ObjectId(active_workspace),
        },
      },
    );

    return {
      error: null,
      data: myContact,
    };
  }

  //assign contact
  async createAssignContact(
    client: SocketType,
    assignContactsDto: AssignContactsDto,
  ) {
    const owner = await this.user_repository.get_by_id(
      assignContactsDto.userId,
    );

    if (!owner) {
      return {
        error: 'Team mate not found',
        data: null,
      };
    }

    const contact = await this.user_repository.get_by_id(
      assignContactsDto.contactId,
    );

    if (!contact) {
      return {
        error: 'Contact not found',
        data: null,
      };
    }

    const active_workspace = await this.get_active_workspace(
      client.user as JwtPayload,
    );

    await this.myContactRepository.upsert(
      {
        contact: new mongoose.Types.ObjectId(contact.id),
      },
      {
        $setOnInsert: {
          contact: new mongoose.Types.ObjectId(contact.id),
          ownedBy: new mongoose.Types.ObjectId(owner.id),
          workspace: new mongoose.Types.ObjectId(active_workspace),
        },
      },
    );

    const myContact = await this.user_repository.update_one_by_id(contact.id, {
      $set: {
        owner: new mongoose.Types.ObjectId(owner.id),
      },
    });

    return {
      error: null,
      data: myContact,
    };
  }

  //create new assignment
  async createAssignment(createAssignedContactsDto: CreateAssignedContactsDto) {
    const alreadyExists = await this.assigned_contacts_repository.findByEmail(
      createAssignedContactsDto.email,
    );

    if (alreadyExists.length !== 0) {
      return this.assigned_contacts_repository.update_one(
        { email: createAssignedContactsDto.email },
        { $push: createAssignedContactsDto.contact },
      );
    }

    return this.assigned_contacts_repository.create({
      ...createAssignedContactsDto,
    });
  }

  async updateAssignment(
    email: string,
    updateAssignedContactsDto: UpdateAssignedContactsDto,
  ) {
    return this.assigned_contacts_repository.update_one(
      { email },
      { $push: { ...updateAssignedContactsDto } },
    );
  }

  //recent contacts
  async findRecentContacts(user: JwtPayload, active_workspace: string) {
    const recentlyViewedContacts = await this.viewedContactRepository.get_all(
      {
        viewedBy: new mongoose.Types.ObjectId(user.sub),
        workspace: new mongoose.Types.ObjectId(active_workspace),
      },
      undefined,
      { sort: { createdAt: -1 }, limit: 30 },
    );

    const contacts = recentlyViewedContacts.map((contact) => contact.contact);
    return contacts;
  }

  //my contacts
  async findMyContacts(user: JwtPayload) {
    const { sub } = user;
    const myContacts = await this.myContactRepository.get_all({
      ownedBy: new mongoose.Types.ObjectId(sub),
      populate: 'contact',
    });
    const contacts = myContacts.map((contact) => contact.contact);
    return contacts;
  }

  async findAllContactsAssignment() {
    return await this.assigned_contacts_repository.findAll();
  }

  async remove(id: string) {
    await this.conversationsRepository.delete_many({
      lead: new mongoose.Types.ObjectId(id),
    });

    await this.customFieldContactRepository.delete_many({
      contact_id: new mongoose.Types.ObjectId(id),
    });

    await this.listRepository.update_many(
      {},
      {
        $pull: {
          contact_ids: id,
        },
      },
    );

    return this.user_repository.delete_by_id(id);
  }

  async upload(csv: RequiredContactCSVData[], user: JwtPayload) {
    try {
      const contacts = await this.convertCsvToJson(csv);
      const active_workspace = await this.get_active_workspace(user);
      this.user_repository
        .create_many(contacts, active_workspace)
        .then((res) => {
          // TODO: send socket event to update contacts list
          Logger.log('success', res);
        })
        .catch((err) => {
          Logger.error('Error: Failed to compete contact cvs import', err);
        });
      const all_contacts = await this.user_repository.get_all({
        workspace: new mongoose.Types.ObjectId(active_workspace),
      });

      return all_contacts;
    } catch (e: any) {
      Logger.error('error', e);
    }
  }

  async get_active_workspace(user: JwtPayload) {
    const session = await this.redisService.get_session(
      user.sub,
      user.session_id,
    );
    return session.active_workspace;
  }

  async convertCsvToJson(csvData: RequiredContactCSVData[]) {
    const required_headers: (keyof RequiredContactCSVData)[] = [
      'first_name',
      'last_name',
      'email',
      'phone',
      'company_name',
      'company_website',
    ];
    const custom_fields = [];

    const headers = Object.keys(csvData[0]);
    const missing_headers = required_headers.filter(
      (header) => !headers.includes(header),
    );

    if (missing_headers.length > 0) {
      throw new Error(
        `Missing required headers: ${missing_headers.join(', ')}`,
      );
    }

    const contacts = csvData.map((row) => {
      const contact = {
        user_name: row['first_name'] + ' ' + row['last_name'],
        email: row['email'],
        phone_number: row['phone'],
        company_name: row['company_name'],
        company_website: row['company_website'],
        contact_type: CONTACT_TYPE.USER,
      };

      Object.keys(row).forEach((key: keyof RequiredContactCSVData) => {
        if (!required_headers.includes(key)) {
          custom_fields.push(key);
          contact['custom_fields'] = {
            [key]: row[key],
          };
        }
      });

      return contact;
    });

    return contacts;
  }
}

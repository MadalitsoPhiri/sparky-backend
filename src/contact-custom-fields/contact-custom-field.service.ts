import { Injectable } from '@nestjs/common';
import {
  CreateCustomFieldContactDto,
  UpdateContactCustomFieldDto,
} from './dto/create-contact-custom-field.dto';
import { CustomFieldContactRepository } from './repository';

@Injectable()
export class CustomFieldContactService {
  constructor(
    private custom_field_contact_repository: CustomFieldContactRepository,
  ) {}

  async create(createCustomFieldContactDto: CreateCustomFieldContactDto) {
    return await this.custom_field_contact_repository.create({
      ...createCustomFieldContactDto,
    });
  }

  async update(updateCustomFieldContactDto: UpdateContactCustomFieldDto) {
    const customFieldContactFilter = {
      contact_id: updateCustomFieldContactDto.contactId,
      custom_field_id: updateCustomFieldContactDto.customFieldId,
    };

    const updateQuery = {
      value: updateCustomFieldContactDto.value,
    };

    return await this.custom_field_contact_repository.update_one(
      customFieldContactFilter,
      updateQuery,
    );
  }

  async getByContactId(contactId: string) {
    const filter = { contact_id: contactId };
    const customFieldContacts =
      await this.custom_field_contact_repository.get_all(filter);
    return {
      data: customFieldContacts,
      error: null,
    };
  }

  async getByCustomFieldId(customFieldId: string) {
    const filter = { custom_field_id: customFieldId };
    return await this.custom_field_contact_repository.get_all(filter);
  }
}

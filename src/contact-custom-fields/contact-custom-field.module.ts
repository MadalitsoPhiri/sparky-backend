import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CustomFieldContact,
  CustomFieldContactSchema,
} from 'src/contact-custom-fields/entities/custom-field-contact.entity';
import { CustomFieldContactRepository } from 'src/contact-custom-fields/repository';
import { CustomFieldsService } from 'src/custom-fields/custom-fields.service';
import {
  CustomField,
  CustomFieldSchema,
} from 'src/custom-fields/entities/custom-field.entity';
import { CustomFieldsRepository } from 'src/custom-fields/respository';
import { ContactCustomFieldGateway } from './contact-custom-field.gateway';
import { CustomFieldContactService } from './contact-custom-field.service';

@Global()
@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      {
        name: CustomFieldContact.name,
        schema: CustomFieldContactSchema,
      },
      { name: CustomField.name, schema: CustomFieldSchema },
    ]),
  ],
  controllers: [],
  providers: [
    ContactCustomFieldGateway,
    CustomFieldContactRepository,
    CustomFieldContactService,
    CustomFieldsRepository,
    CustomFieldsService,
  ],
})
export class CustomFieldContactModule {}

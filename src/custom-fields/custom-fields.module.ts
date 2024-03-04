import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkSpaces, WorkSpacesSchema } from 'src/auth/entities';
import {
  CustomFieldContact,
  CustomFieldContactSchema,
} from 'src/contact-custom-fields/entities/custom-field-contact.entity';
import { CustomFieldContactRepository } from 'src/contact-custom-fields/repository';
import { CustomFieldsController } from './custom-fields.controller';
import { CustomFieldsService } from './custom-fields.service';
import { CustomField, CustomFieldSchema } from './entities/custom-field.entity';
import { CustomFieldsRepository } from './respository';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: CustomField.name, schema: CustomFieldSchema },
      { name: WorkSpaces.name, schema: WorkSpacesSchema },
      {
        name: CustomFieldContact.name,
        schema: CustomFieldContactSchema,
      },
    ]),
  ],
  controllers: [CustomFieldsController],
  providers: [
    CustomFieldsService,
    CustomFieldsRepository,
    CustomFieldContactRepository,
  ],
})
export class CustomFieldsModule {}

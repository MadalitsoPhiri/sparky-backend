import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, UpdateResult } from 'mongodb';
import {
  AnyKeys,
  AnyObject,
  FilterQuery,
  Model,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import { BaseRepository } from 'src/app/entities/Base.repository';
import { CustomFieldContact } from '../entities/custom-field-contact.entity';

@Injectable()
export class CustomFieldContactRepository extends BaseRepository<CustomFieldContact> {
  constructor(
    @InjectModel(CustomFieldContact.name)
    private custom_field_contact_model: Model<CustomFieldContact>,
  ) {
    super();
  }

  async create(
    doc: AnyObject | AnyKeys<CustomFieldContact>,
  ): Promise<CustomFieldContact> {
    return await this.custom_field_contact_model.create(doc);
  }

  async get_by_id(id: string): Promise<CustomFieldContact> {
    return await this.custom_field_contact_model.findById(id);
  }

  async get_one(
    filter?: FilterQuery<CustomFieldContact>,
  ): Promise<CustomFieldContact> {
    return await this.custom_field_contact_model.findOne(filter);
  }

  async get_all(
    filter: FilterQuery<CustomFieldContact>,
  ): Promise<CustomFieldContact[]> {
    return await this.custom_field_contact_model.find(filter);
  }

  async update_one(
    filter: FilterQuery<CustomFieldContact>,
    update: UpdateQuery<CustomFieldContact>,
  ): Promise<CustomFieldContact> {
    return await this.custom_field_contact_model.findOneAndUpdate(
      filter,
      update,
      {
        new: true,
        upsert: true,
      },
    );
  }

  async update_one_by_id(
    id: string,
    update: UpdateQuery<CustomFieldContact>,
  ): Promise<CustomFieldContact> {
    return await this.custom_field_contact_model.findByIdAndUpdate(id, update);
  }

  async update_many(
    filter?: FilterQuery<CustomFieldContact>,
    update?: UpdateWithAggregationPipeline | UpdateQuery<CustomFieldContact>,
  ): Promise<UpdateResult> {
    return await this.custom_field_contact_model.updateMany(filter, update);
  }

  async delete_by_id(id?: string): Promise<CustomFieldContact> {
    return await this.custom_field_contact_model.findByIdAndDelete(id);
  }

  async delete_one(
    filter: FilterQuery<CustomFieldContact>,
  ): Promise<CustomFieldContact> {
    return await this.custom_field_contact_model.findOneAndDelete(filter);
  }

  async delete_many(
    filter: FilterQuery<CustomFieldContact>,
  ): Promise<DeleteResult> {
    return await this.custom_field_contact_model.deleteMany(filter);
  }

  async check_exists(
    filter: FilterQuery<CustomFieldContact>,
  ): Promise<{ _id: any }> {
    return await this.custom_field_contact_model.exists(filter);
  }
}

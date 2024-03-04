import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateResult } from 'mongodb';
import {
  AnyKeys,
  AnyObject,
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import { BaseRepository } from 'src/app/entities/Base.repository';
import { CustomField } from '../entities/custom-field.entity';

@Injectable()
export class CustomFieldsRepository extends BaseRepository<CustomField> {
  constructor(
    @InjectModel(CustomField.name)
    private custom_field_model: Model<CustomField>,
  ) {
    super();
  }
  async create(doc: AnyObject | AnyKeys<CustomField>): Promise<CustomField> {
    return this.custom_field_model.create(doc);
  }
  async update_one(
    filter: FilterQuery<CustomField>,
    update: UpdateQuery<CustomField>,
  ): Promise<CustomField> {
    return this.custom_field_model.findOneAndUpdate(filter, update, {
      new: true,
    });
  }
  async delete_by_id(
    id?: string,
    options?: QueryOptions<CustomField>,
  ): Promise<any> {
    return this.custom_field_model.findByIdAndDelete(id);
  }
  async get_all(
    filter: FilterQuery<CustomField>,
    projection?: ProjectionType<CustomField>,
  ): Promise<CustomField[]> {
    return this.custom_field_model.find(filter);
  }

  async get_by_id(
    id: any,
    projection?: ProjectionType<CustomField>,
    options?: QueryOptions<CustomField>,
  ): Promise<CustomField> {
    return this.custom_field_model.findById(id);
  }
  async get_one(
    filter?: FilterQuery<CustomField>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<CustomField>,
    options?: QueryOptions<CustomField>,
  ): Promise<CustomField> {
    return this.custom_field_model.findOne(filter);
  }
  async update_many(
    filter?: FilterQuery<CustomField>,
    update?: UpdateWithAggregationPipeline | UpdateQuery<CustomField>,
    options?: QueryOptions<CustomField>,
  ): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }

  update_one_by_id(
    id: string,
    update: UpdateQuery<CustomField>,
  ): Promise<CustomField> {
    throw new Error('Method not implemented.');
  }

  delete_one(
    filter: FilterQuery<CustomField>,
    options?: QueryOptions<CustomField>,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  delete_many(filter: FilterQuery<CustomField>): Promise<any> {
    throw new Error('Method not implemented.');
  }

  check_exists(filter: FilterQuery<CustomField>): Promise<any> {
    throw new Error('Method not implemented.');
  }
}

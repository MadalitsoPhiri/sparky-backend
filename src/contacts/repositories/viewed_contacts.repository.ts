import { Injectable } from '@nestjs/common';
import { InjectModel, SchemaFactory } from '@nestjs/mongoose';
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
import { ViewedContacts } from '../entities/viewed_contacts.schema';

@Injectable()
export class ViewedContactsRepository extends BaseRepository<ViewedContacts> {
  constructor(
    @InjectModel(ViewedContacts.name)
    private viewedContactsModel: Model<ViewedContacts>,
  ) {
    super();
  }
  create(doc: AnyObject | AnyKeys<ViewedContacts>): Promise<ViewedContacts> {
    return this.viewedContactsModel.create(doc);
  }

  async upsert(
    filter: FilterQuery<ViewedContacts>,
    update: UpdateQuery<ViewedContacts>,
  ): Promise<ViewedContacts> {
    const viewedContactsRecord =
      await this.viewedContactsModel.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true,
      });
    return viewedContactsRecord;
  }

  async get_by_id(id: any): Promise<ViewedContacts> {
    const viewedContactsRecord = await this.viewedContactsModel.findById(id);
    return viewedContactsRecord;
  }

  async update_one_by_id(
    id: string,
    update: UpdateQuery<ViewedContacts>,
  ): Promise<ViewedContacts> {
    const viewedContactsRecord =
      await this.viewedContactsModel.findByIdAndUpdate(id, update, {
        new: true,
      });
    return viewedContactsRecord;
  }

  async delete_by_id(id?: string): Promise<any> {
    const viewedContactsRecord =
      await this.viewedContactsModel.findByIdAndDelete(id);
    return viewedContactsRecord;
  }

  get_one(
    filter?: FilterQuery<ViewedContacts>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<ViewedContacts>,
    options?: QueryOptions<ViewedContacts>,
  ): Promise<ViewedContacts> {
    throw new Error('Method not implemented.');
  }
  async get_all(
    filter: FilterQuery<ViewedContacts>,
    projection?: ProjectionType<ViewedContacts>,
    options?: QueryOptions<ViewedContacts>,
  ): Promise<ViewedContacts[]> {
    return await this.viewedContactsModel
      .find(filter, projection, options)
      .populate(
        'contact',
        'user_name email phone_number createdAt updatedAt last_seen country city',
      )
      .exec();
  }

  update_many(
    filter?: FilterQuery<ViewedContacts>,
    update?: UpdateQuery<ViewedContacts> | UpdateWithAggregationPipeline,
    options?: QueryOptions<ViewedContacts>,
  ): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }
  update_one(
    filter: FilterQuery<ViewedContacts>,
    update: UpdateQuery<ViewedContacts>,
  ): Promise<ViewedContacts> {
    return this.viewedContactsModel
      .findOneAndUpdate(filter, { $push: { contacts: update } })
      .exec();
  }

  delete_one(
    filter: FilterQuery<ViewedContacts>,
    options?: QueryOptions<ViewedContacts>,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }

  delete_many(filter: FilterQuery<ViewedContacts>): Promise<any> {
    throw new Error('Method not implemented.');
  }

  check_exists(filter: FilterQuery<ViewedContacts>): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<ViewedContacts[]> {
    return this.viewedContactsModel.find().exec();
  }

  async deleteByEmail(email: string): Promise<ViewedContacts | null> {
    return this.viewedContactsModel.findOneAndDelete({ email }).exec();
  }
}

export const usersSchema = SchemaFactory.createForClass(
  ViewedContactsRepository,
);

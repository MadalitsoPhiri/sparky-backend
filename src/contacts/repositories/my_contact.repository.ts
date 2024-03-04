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
import { MyContact } from '../entities/my_contacts.schema';

@Injectable()
export class MyContactRepository extends BaseRepository<MyContact> {
  constructor(
    @InjectModel(MyContact.name)
    private myContactModel: Model<MyContact>,
  ) {
    super();
  }
  create(doc: AnyObject | AnyKeys<MyContact>): Promise<MyContact> {
    return this.myContactModel.create(doc);
  }

  async upsert(
    filter: FilterQuery<MyContact>,
    update: UpdateQuery<MyContact>,
  ): Promise<MyContact> {
    const myContactRecord = await this.myContactModel.findOneAndUpdate(
      filter,
      update,
      {
        new: true,
        upsert: true,
      },
    );
    return myContactRecord;
  }

  async get_by_id(id: any): Promise<MyContact> {
    const myContactRecord = await this.myContactModel.findById(id);
    return myContactRecord;
  }

  async update_one_by_id(
    id: string,
    update: UpdateQuery<MyContact>,
  ): Promise<MyContact> {
    const myContactRecord = await this.myContactModel.findByIdAndUpdate(
      id,
      update,
      {
        new: true,
      },
    );
    return myContactRecord;
  }

  async delete_by_id(id?: string): Promise<any> {
    const myContactRecord = await this.myContactModel.findByIdAndDelete(id);
    return myContactRecord;
  }

  get_one(
    filter?: FilterQuery<MyContact>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<MyContact>,
    options?: QueryOptions<MyContact>,
  ): Promise<MyContact> {
    throw new Error('Method not implemented.');
  }
  async get_all(
    filter: FilterQuery<MyContact>,
    projection?: ProjectionType<MyContact>,
    options?: QueryOptions<MyContact>,
  ): Promise<MyContact[]> {
    return await this.myContactModel
      .find(filter, projection, options)
      .populate(
        'contact',
        'user_name email phone_number createdAt updatedAt last_seen country city',
      )
      .exec();
  }

  update_many(
    filter?: FilterQuery<MyContact>,
    update?: UpdateQuery<MyContact> | UpdateWithAggregationPipeline,
    options?: QueryOptions<MyContact>,
  ): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }
  update_one(
    filter: FilterQuery<MyContact>,
    update: UpdateQuery<MyContact>,
  ): Promise<MyContact> {
    return this.myContactModel
      .findOneAndUpdate(filter, { $push: { contacts: update } })
      .exec();
  }

  delete_one(
    filter: FilterQuery<MyContact>,
    options?: QueryOptions<MyContact>,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }

  delete_many(filter: FilterQuery<MyContact>): Promise<any> {
    throw new Error('Method not implemented.');
  }

  check_exists(filter: FilterQuery<MyContact>): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<MyContact[]> {
    return this.myContactModel.find().exec();
  }

  async deleteByEmail(email: string): Promise<MyContact | null> {
    return this.myContactModel.findOneAndDelete({ email }).exec();
  }
}

export const usersSchema = SchemaFactory.createForClass(MyContactRepository);

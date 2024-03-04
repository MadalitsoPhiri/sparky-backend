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
import { List } from '../entities/list.entity';

@Injectable()
export class ListRepository extends BaseRepository<List> {
  constructor(
    @InjectModel(List.name)
    private list_model: Model<List>,
  ) {
    super();
  }

  async get_all(
    filter: FilterQuery<List>,
    projection?: ProjectionType<List>,
  ): Promise<List[]> {
    return await this.list_model.find(filter, projection);
  }

  async create(doc: AnyObject | AnyKeys<List>): Promise<List> {
    return await this.list_model.create(doc);
  }
  update_one(
    filter: FilterQuery<List>,
    update: UpdateQuery<List>,
  ): Promise<List> {
    throw new Error('Method not implemented.');
  }

  async get_by_id(
    id: any,
    projection?: ProjectionType<List>,
    options?: QueryOptions<List>,
  ): Promise<List> {
    return this.list_model.findById(id, projection, options);
  }

  get_one(
    filter?: FilterQuery<List>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<List>,
    options?: QueryOptions<List>,
  ): Promise<List> {
    throw new Error('Method not implemented.');
  }
  async update_many(
    filter?: FilterQuery<List>,
    update?: UpdateQuery<List> | UpdateWithAggregationPipeline,
    options?: QueryOptions<List>,
  ): Promise<UpdateResult> {
    return await this.list_model.updateMany(filter, update, options);
  }

  async update_one_by_id(id: string, update: UpdateQuery<List>): Promise<List> {
    return await this.list_model.findByIdAndUpdate(
      id,
      {
        $set: {
          name: update.name,
          contact_ids: update.contacts,
        },
      },
      {
        new: true,
      },
    );
  }

  async delete_by_id(id?: string, options?: QueryOptions<List>): Promise<any> {
    return await this.list_model.findByIdAndDelete(id, options);
  }

  delete_one(
    filter: FilterQuery<List>,
    options?: QueryOptions<List>,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  delete_many(filter: FilterQuery<List>): Promise<any> {
    throw new Error('Method not implemented.');
  }

  check_exists(filter: FilterQuery<List>): Promise<any> {
    throw new Error('Method not implemented.');
  }
}

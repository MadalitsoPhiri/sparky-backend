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
import { Advertisements } from '../entities/advertisement.entity';

export class AdvertisementsRepository extends BaseRepository<Advertisements> {
  constructor(
    @InjectModel(Advertisements.name)
    private advertisements_model: Model<Advertisements>,
  ) {
    super();
  }

  async create(doc: AnyObject | AnyKeys<Advertisements>) {
    const advert = await this.advertisements_model.create(doc);
    return advert;
  }

  async get_all(
    filter: FilterQuery<Advertisements>,
    projection?: ProjectionType<Advertisements>,
  ): Promise<Advertisements[]> {
    return await this.advertisements_model.find(filter, projection);
  }

  async delete_by_id(id?: string): Promise<any> {
    const advert = await this.advertisements_model.findByIdAndDelete(id);
    return advert;
  }

  async get_by_id(
    id: any,
    projection?: ProjectionType<Advertisements>,
    options?: QueryOptions<Advertisements>,
  ): Promise<Advertisements> {
    return await this.advertisements_model.findById(id).exec();
  }
  async get_one(
    filter?: FilterQuery<Advertisements>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<Advertisements>,
    options?: QueryOptions<Advertisements>,
  ): Promise<Advertisements> {
    return this.advertisements_model
      .findOne(filter, projection, options)
      .exec();
  }

  async update_one_by_id(
    id: string,
    update: UpdateQuery<Advertisements>,
  ): Promise<Advertisements> {
    return await this.advertisements_model.findByIdAndUpdate(id, update, {
      new: true,
    });
  }

  update_many(
    filter?: FilterQuery<Advertisements>,
    update?: UpdateWithAggregationPipeline | UpdateQuery<Advertisements>,
    options?: QueryOptions<Advertisements>,
  ): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }
  update_one(
    filter: FilterQuery<Advertisements>,
    update: UpdateQuery<Advertisements>,
  ): Promise<Advertisements> {
    throw new Error('Method not implemented.');
  }

  delete_one(
    filter: FilterQuery<Advertisements>,
    options?: QueryOptions<Advertisements>,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  delete_many(filter: FilterQuery<Advertisements>): Promise<any> {
    throw new Error('Method not implemented.');
  }

  check_exists(filter: FilterQuery<Advertisements>): Promise<any> {
    throw new Error('Method not implemented.');
  }
}

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
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagRepository extends BaseRepository<Tag> {
  constructor(
    @InjectModel(Tag.name)
    private tagModel: Model<Tag>,
  ) {
    super();
  }

  get_all(
    filter: FilterQuery<Tag>,
    projection?: ProjectionType<Tag>,
    options?: QueryOptions<Tag>,
  ): Promise<Tag[]> {
    return this.tagModel.find(filter, projection, options).exec();
  }
  get_by_id(
    id: any,
    projection?: ProjectionType<Tag>,
    options?: QueryOptions<Tag>,
  ): Promise<Tag> {
    return this.tagModel.findById(id, projection, options).exec();
  }
  get_one(
    filter?: FilterQuery<Tag>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<Tag>,
    options?: QueryOptions<Tag>,
  ): Promise<Tag> {
    return this.tagModel
      .findOne(filter, projection, options)
      .populate(populate)
      .select(select)
      .exec();
  }
  update_many(
    filter?: FilterQuery<Tag>,
    update?: UpdateQuery<Tag> | UpdateWithAggregationPipeline,
    options?: QueryOptions<Tag>,
  ): Promise<UpdateResult> {
    return this.tagModel.updateMany(filter, update, options).exec();
  }
  update_one(filter: FilterQuery<Tag>, update: UpdateQuery<Tag>): Promise<Tag> {
    return this.tagModel.findOneAndUpdate(filter, update).exec();
  }
  update_one_by_id(id: string, update: UpdateQuery<Tag>): Promise<Tag> {
    return this.tagModel.findByIdAndUpdate(id, update).exec();
  }
  delete_by_id(id?: string, options?: QueryOptions<Tag>): Promise<Tag> {
    return this.tagModel.findByIdAndDelete(id, options).exec();
  }
  delete_one(
    filter: FilterQuery<Tag>,
    options?: QueryOptions<Tag>,
  ): Promise<any> {
    return this.tagModel.findOneAndDelete(filter, options).exec();
  }
  delete_many(filter: FilterQuery<Tag>): Promise<any> {
    return this.tagModel.deleteMany(filter).exec();
  }
  create(doc: AnyObject | AnyKeys<Tag>): Promise<Tag> {
    return this.tagModel.create(doc);
  }
  check_exists(filter: FilterQuery<Tag>): Promise<any> {
    throw new Error('Method not implemented.');
  }
}

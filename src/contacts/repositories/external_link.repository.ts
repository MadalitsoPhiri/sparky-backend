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
import { ExternalLink } from '../entities/external_links.entity';

@Injectable()
export class ExternalLinkRepository extends BaseRepository<ExternalLink> {
  constructor(
    @InjectModel(ExternalLink.name)
    private external_link_model: Model<ExternalLink>,
  ) {
    super();
  }
  async get_all(
    filter: FilterQuery<ExternalLink>,
    projection?: ProjectionType<ExternalLink>,
    options?: QueryOptions<ExternalLink>,
  ) {
    return await this.external_link_model.find(filter, projection, options);
  }
  async get_by_id(
    id: any,
    projection?: ProjectionType<ExternalLink>,
    options?: QueryOptions<ExternalLink>,
  ) {
    return await this.external_link_model.findById(id, projection, options);
  }
  get_one(
    filter?: FilterQuery<ExternalLink>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<ExternalLink>,
    options?: QueryOptions<ExternalLink>,
  ): Promise<ExternalLink> {
    throw new Error('Method not implemented.');
  }
  update_many(
    filter?: FilterQuery<ExternalLink>,
    update?: UpdateQuery<ExternalLink> | UpdateWithAggregationPipeline,
    options?: QueryOptions<ExternalLink>,
  ): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }
  update_one(
    filter: FilterQuery<ExternalLink>,
    update: UpdateQuery<ExternalLink>,
  ): Promise<ExternalLink> {
    throw new Error('Method not implemented.');
  }
  update_one_by_id(
    id: string,
    update: UpdateQuery<ExternalLink>,
  ): Promise<ExternalLink> {
    throw new Error('Method not implemented.');
  }
  async delete_by_id(
    id?: string,
    options?: QueryOptions<ExternalLink>,
  ): Promise<any> {
    return await this.external_link_model.findByIdAndDelete(id, options);
  }
  async delete_one(
    filter: FilterQuery<ExternalLink>,
    options?: QueryOptions<ExternalLink>,
  ): Promise<any> {
    return await this.external_link_model.deleteOne(filter, options);
  }
  delete_many(filter: FilterQuery<ExternalLink>): Promise<any> {
    throw new Error('Method not implemented.');
  }
  async create(doc: AnyObject | AnyKeys<ExternalLink>) {
    return await this.external_link_model.create(doc);
  }
  async check_exists(filter: FilterQuery<ExternalLink>) {
    return await this.external_link_model.exists(filter);
  }
}

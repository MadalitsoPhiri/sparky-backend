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
import { Integration } from './entities/integration.entity';

@Injectable()
export class IntegrationRepository extends BaseRepository<Integration> {
  constructor(
    @InjectModel(Integration.name)
    private integration_model: Model<Integration>,
  ) {
    super();
  }
  async upsert(integration: Integration): Promise<Integration> {
    return this.integration_model
      .findOneAndUpdate(
        {
          name: integration.name,
        },
        integration,
        {
          upsert: true,
          new: true,
        },
      )
      .exec();
  }
  get_all(
    filter: FilterQuery<Integration>,
    projection?: ProjectionType<Integration>,
  ): Promise<Integration[]> {
    return this.integration_model.find(filter, projection).exec();
  }
  get_by_id(
    id: any,
    projection?: ProjectionType<Integration>,
    options?: QueryOptions<Integration>,
  ): Promise<Integration> {
    return this.integration_model.findById(id, projection, options).exec();
  }
  get_one(
    filter?: FilterQuery<Integration>,
    projection?: ProjectionType<Integration>,
    options?: QueryOptions<Integration>,
  ): Promise<Integration> {
    return this.integration_model.findOne(filter, projection, options).exec();
  }
  update_many(
    filter?: FilterQuery<Integration>,
    update?: UpdateQuery<Integration> | UpdateWithAggregationPipeline,
    options?: QueryOptions<Integration>,
  ): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }
  update_one(
    filter: FilterQuery<Integration>,
    update: UpdateQuery<Integration>,
  ): Promise<Integration> {
    throw new Error('Method not implemented.');
  }
  update_one_by_id(
    id: string,
    update: UpdateQuery<Integration>,
  ): Promise<Integration> {
    throw new Error('Method not implemented.');
  }
  delete_by_id(id?: string, options?: QueryOptions<Integration>): Promise<any> {
    throw new Error('Method not implemented.');
  }
  delete_one(
    filter: FilterQuery<Integration>,
    options?: QueryOptions<Integration>,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  delete_many(filter: FilterQuery<Integration>): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.integration_model.deleteMany(filter);
  }
  create(doc: AnyObject | AnyKeys<Integration>): Promise<Integration> {
    return this.integration_model.create(doc);
  }
  check_exists(filter: FilterQuery<Integration>): Promise<any> {
    throw new Error('Method not implemented.');
  }
  save_integration_credential(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}

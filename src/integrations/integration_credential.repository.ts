import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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

import { UpdateResult } from 'mongodb';
import { IntegrationCredential } from './entities/integration_credential.entity';

@Injectable()
export class IntegrationCredentialRepository extends BaseRepository<IntegrationCredential> {
  constructor(
    @InjectModel(IntegrationCredential.name)
    private integrationCredentialsModel: Model<IntegrationCredential>,
  ) {
    super();
  }
  get_all(
    filter: FilterQuery<IntegrationCredential>,
    projection?: ProjectionType<IntegrationCredential>,
  ): Promise<IntegrationCredential[]> {
    throw new Error('Method not implemented.');
  }
  get_by_id(
    id: any,
    projection?: ProjectionType<IntegrationCredential>,
    options?: QueryOptions<IntegrationCredential>,
  ): Promise<IntegrationCredential> {
    throw new Error('Method not implemented.');
  }
  get_one(
    filter?: FilterQuery<IntegrationCredential>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<IntegrationCredential>,
    options?: QueryOptions<IntegrationCredential>,
  ): Promise<IntegrationCredential> {
    return this.integrationCredentialsModel.findOne(filter).exec();
  }
  update_many(
    filter?: FilterQuery<IntegrationCredential>,
    update?: UpdateQuery<IntegrationCredential> | UpdateWithAggregationPipeline,
    options?: QueryOptions<IntegrationCredential>,
  ): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }
  update_one(
    filter: FilterQuery<IntegrationCredential>,
    update: UpdateQuery<IntegrationCredential>,
  ): Promise<IntegrationCredential> {
    return this.integrationCredentialsModel
      .findOneAndUpdate(filter, update, { new: true })
      .exec();
  }
  update_one_by_id(
    id: string,
    update: UpdateQuery<IntegrationCredential>,
  ): Promise<IntegrationCredential> {
    throw new Error('Method not implemented.');
  }
  delete_by_id(
    id?: string,
    options?: QueryOptions<IntegrationCredential>,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  delete_one(
    filter: FilterQuery<IntegrationCredential>,
    options?: QueryOptions<IntegrationCredential>,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  delete_many(filter: FilterQuery<IntegrationCredential>): Promise<any> {
    throw new Error('Method not implemented.');
  }
  create(
    doc: AnyObject | AnyKeys<IntegrationCredential>,
  ): Promise<IntegrationCredential> {
    return this.integrationCredentialsModel.create(doc);
  }
  check_exists(filter: FilterQuery<IntegrationCredential>): Promise<any> {
    throw new Error('Method not implemented.');
  }
}

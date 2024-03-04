import {
  FilterQuery,
  UpdateQuery,
  AnyKeys,
  Model,
  ProjectionType,
  QueryOptions,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import { BaseRepository } from 'src/app/entities/Base.repository';
import { CompanyContext } from '../entities/schema';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateResult } from 'mongodb';

export class CompanyContextRepository extends BaseRepository<CompanyContext> {
  constructor(
    @InjectModel(CompanyContext.name)
    private company_context_model: Model<CompanyContext>,
  ) {
    super();
  }

  async create(doc: AnyKeys<CompanyContext>): Promise<CompanyContext> {
    const new_company_context = await this.company_context_model.create(doc);

    return new_company_context.save();
  }

  async create_many(doc: AnyKeys<CompanyContext>[]): Promise<CompanyContext[]> {
    throw new Error('Method not implemented.');
  }

  async get_all(
    filter: FilterQuery<CompanyContext>,
  ): Promise<CompanyContext[]> {
    throw new Error('Method not implemented.');
  }

  async update_one_by_id(
    id: string,
    update: UpdateQuery<CompanyContext>,
  ): Promise<CompanyContext> {
    return await this.company_context_model
      .findByIdAndUpdate(id, update, {
        new: true,
      })
      .populate({
        path: 'workspace',
      })
      .exec();
  }

  async delete_by_id(id: string): Promise<any> {
    return await this.company_context_model.findByIdAndDelete(id).exec();
  }

  async get_by_id(
    id: any,
    projection?: ProjectionType<CompanyContext>,
    options?: QueryOptions<CompanyContext>,
  ): Promise<CompanyContext> {
    return this.company_context_model
      .findById(id)
      .populate({
        path: 'workspace',
      })
      .exec();
  }

  async get_one(
    filter?: FilterQuery<CompanyContext>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<CompanyContext>,
    options?: QueryOptions<CompanyContext>,
  ): Promise<CompanyContext> {
    return await this.company_context_model
      .findOne(filter, projection, options)
      .populate({
        path: 'workspace',
      })
      .exec();
  }

  async update_many(
    filter?: FilterQuery<CompanyContext>,
    update?: UpdateWithAggregationPipeline | UpdateQuery<CompanyContext>,
    options?: QueryOptions<CompanyContext>,
  ): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }

  async update_one(
    filter: FilterQuery<CompanyContext>,
    update: UpdateQuery<CompanyContext>,
  ): Promise<CompanyContext> {
    return this.company_context_model
      .findOneAndUpdate(filter, update, { upsert: true, new: true })
      .populate({
        path: 'workspace',
      })
      .exec();
  }

  async delete_one(
    filter: FilterQuery<CompanyContext>,
    options?: QueryOptions<CompanyContext>,
  ): Promise<any> {
    return this.company_context_model.deleteOne(filter).exec();
  }

  async delete_many(filter: FilterQuery<CompanyContext>): Promise<any> {
    return this.company_context_model.deleteMany(filter).exec();
  }

  async check_exists(filter: FilterQuery<CompanyContext>): Promise<any> {
    return !!this.company_context_model
      .findOne(filter)
      .populate({
        path: 'workspace',
      })
      .exec();
  }

  async update_current(doc: CompanyContext): Promise<CompanyContext> {
    throw new Error('Method not implemented.');
  }
}

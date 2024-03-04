import { InjectModel } from '@nestjs/mongoose';
import { UpdateResult } from 'mongodb';
import {
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateWithAggregationPipeline,
  UpdateQuery,
  AnyObject,
  AnyKeys,
  Model,
} from 'mongoose';
import { BaseRepository } from 'src/app/entities/Base.repository';
import { Faqs } from '../entities/schema';

export class FaqsRespository extends BaseRepository<Faqs> {
  constructor(
    @InjectModel(Faqs.name)
    private faq_model: Model<Faqs>,
  ) {
    super();
  }
  get_all(
    filter: FilterQuery<Faqs>,
    projection?: ProjectionType<Faqs>,
  ): Promise<Faqs[]> {
    return this.faq_model
      .find(filter)
      .populate({
        path: 'workspace',
      })
      .populate({
        path: 'widget_config',
      })
      .exec();
  }
  get_by_id(
    id: any,
    projection?: ProjectionType<Faqs>,
    options?: QueryOptions<Faqs>,
  ): Promise<Faqs> {
    return this.faq_model
      .findById(id)
      .populate({
        path: 'workspace',
      })
      .populate({
        path: 'widget_config',
      })
      .exec();
  }
  get_one(
    filter?: FilterQuery<Faqs>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<Faqs>,
    options?: QueryOptions<Faqs>,
  ): Promise<Faqs> {
    return this.faq_model
      .findOne(filter, projection, options)
      .populate({
        path: 'workspace',
      })
      .populate({
        path: 'widget_config',
      })
      .exec();
  }
  update_many(
    filter?: FilterQuery<Faqs>,
    update?: UpdateWithAggregationPipeline | UpdateQuery<Faqs>,
    options?: QueryOptions<Faqs>,
  ): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }
  update_one_by_id(id: string, update: UpdateQuery<Faqs>): Promise<Faqs> {
    return this.faq_model
      .findByIdAndUpdate(id, update, {
        new: true,
      })
      .populate({
        path: 'workspace',
      })
      .populate({
        path: 'widget_config',
      })
      .exec();
  }
  update_one(
    filter: FilterQuery<Faqs>,
    update: UpdateQuery<Faqs>,
  ): Promise<Faqs> {
    return this.faq_model
      .findOneAndUpdate(filter, update, { new: true })
      .populate({
        path: 'workspace',
      })
      .populate({
        path: 'widget_config',
      })
      .exec();
  }
  delete_by_id(id?: string, options?: QueryOptions<Faqs>): Promise<any> {
    return this.faq_model.findByIdAndDelete(id, options).exec();
  }
  delete_one(
    filter: FilterQuery<Faqs>,
    options?: QueryOptions<Faqs>,
  ): Promise<any> {
    return this.faq_model.deleteOne(filter).exec();
  }
  delete_many(filter: FilterQuery<Faqs>): Promise<any> {
    return this.faq_model.deleteMany(filter).exec();
  }
  async create(doc: AnyObject | AnyKeys<Faqs>): Promise<Faqs> {
    const faq_model = await this.faq_model.create(doc);
    return faq_model.save();
  }
  check_exists(filter: FilterQuery<Faqs>): Promise<any> {
    throw new Error('Method not implemented.');
  }
  update_current(doc: Faqs): Promise<Faqs> {
    throw new Error('Method not implemented.');
  }
}

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
import { DefaultSparkGPTQuestion } from '../entities/schema';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateResult } from 'mongodb';

export class DefaultSparkGPTQuestionRepository extends BaseRepository<DefaultSparkGPTQuestion> {
  constructor(
    @InjectModel(DefaultSparkGPTQuestion.name)
    private default_spark_gpt_question_model: Model<DefaultSparkGPTQuestion>,
  ) {
    super();
  }

  async create(
    doc: AnyKeys<DefaultSparkGPTQuestion>,
  ): Promise<DefaultSparkGPTQuestion> {
    const default_spark_gpt_question_model =
      await this.default_spark_gpt_question_model.create(doc);

    return default_spark_gpt_question_model.save();
  }

  async get_all(
    filter: FilterQuery<DefaultSparkGPTQuestion>,
  ): Promise<DefaultSparkGPTQuestion[]> {
    return await this.default_spark_gpt_question_model.find(filter).exec();
  }

  async update_one_by_id(
    id: string,
    update: UpdateQuery<DefaultSparkGPTQuestion>,
  ): Promise<DefaultSparkGPTQuestion> {
    return await this.default_spark_gpt_question_model
      .findByIdAndUpdate(id, update, {
        new: true,
      })
      .exec();
  }

  async delete_by_id(id: string): Promise<any> {
    return await this.default_spark_gpt_question_model
      .findByIdAndDelete(id)
      .exec();
  }

  async get_by_id(
    id: any,
    projection?: ProjectionType<DefaultSparkGPTQuestion>,
    options?: QueryOptions<DefaultSparkGPTQuestion>,
  ): Promise<DefaultSparkGPTQuestion> {
    return this.default_spark_gpt_question_model.findById(id).exec();
  }

  async get_one(
    filter?: FilterQuery<DefaultSparkGPTQuestion>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<DefaultSparkGPTQuestion>,
    options?: QueryOptions<DefaultSparkGPTQuestion>,
  ): Promise<DefaultSparkGPTQuestion> {
    return this.default_spark_gpt_question_model
      .findOne(filter, projection, options)
      .exec();
  }

  async update_many(
    filter?: FilterQuery<DefaultSparkGPTQuestion>,
    update?:
      | UpdateWithAggregationPipeline
      | UpdateQuery<DefaultSparkGPTQuestion>,
    options?: QueryOptions<DefaultSparkGPTQuestion>,
  ): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }

  async update_one(
    filter: FilterQuery<DefaultSparkGPTQuestion>,
    update: UpdateQuery<DefaultSparkGPTQuestion>,
  ): Promise<DefaultSparkGPTQuestion> {
    return this.default_spark_gpt_question_model
      .findOneAndUpdate(filter, update, { new: true })
      .exec();
  }

  async delete_one(
    filter: FilterQuery<DefaultSparkGPTQuestion>,
    options?: QueryOptions<DefaultSparkGPTQuestion>,
  ): Promise<any> {
    return this.default_spark_gpt_question_model.deleteOne(filter).exec();
  }

  async delete_many(
    filter: FilterQuery<DefaultSparkGPTQuestion>,
  ): Promise<any> {
    return this.default_spark_gpt_question_model.deleteMany(filter).exec();
  }

  async check_exists(
    filter: FilterQuery<DefaultSparkGPTQuestion>,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async update_current(
    doc: DefaultSparkGPTQuestion,
  ): Promise<DefaultSparkGPTQuestion> {
    throw new Error('Method not implemented.');
  }
}

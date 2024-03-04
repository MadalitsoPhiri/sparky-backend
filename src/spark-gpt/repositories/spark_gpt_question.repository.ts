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
import { SparkGPTQuestion } from '../entities/schema';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateResult } from 'mongodb';

export class SparkGPTQuestionRepository extends BaseRepository<SparkGPTQuestion> {
  constructor(
    @InjectModel(SparkGPTQuestion.name)
    private spark_gpt_question_model: Model<SparkGPTQuestion>,
  ) {
    super();
  }

  async create(doc: AnyKeys<SparkGPTQuestion>): Promise<SparkGPTQuestion> {
    const new_spark_gpt_question = await this.spark_gpt_question_model.create(
      doc,
    );

    return new_spark_gpt_question.save();
  }

  async create_many(
    doc: AnyKeys<SparkGPTQuestion>[],
  ): Promise<SparkGPTQuestion[]> {
    const new_spark_gpt_question_list =
      await this.spark_gpt_question_model.insertMany(doc);

    new_spark_gpt_question_list.forEach((new_spark_gpt_question) =>
      new_spark_gpt_question.save(),
    );

    return new_spark_gpt_question_list;
  }

  async get_all(
    filter: FilterQuery<SparkGPTQuestion>,
  ): Promise<SparkGPTQuestion[]> {
    return await this.spark_gpt_question_model
      .find(filter)
      .populate({
        path: 'workspace',
      })
      .exec();
  }

  async update_one_by_id(
    id: string,
    update: UpdateQuery<SparkGPTQuestion>,
  ): Promise<SparkGPTQuestion> {
    return await this.spark_gpt_question_model
      .findByIdAndUpdate(id, update, {
        new: true,
      })
      .populate({
        path: 'workspace',
      })
      .exec();
  }

  async delete_by_id(id: string): Promise<any> {
    return await this.spark_gpt_question_model.findByIdAndDelete(id).exec();
  }

  get_by_id(
    id: any,
    projection?: ProjectionType<SparkGPTQuestion>,
    options?: QueryOptions<SparkGPTQuestion>,
  ): Promise<SparkGPTQuestion> {
    return this.spark_gpt_question_model
      .findById(id)
      .populate({
        path: 'workspace',
      })
      .exec();
  }

  async get_one(
    filter?: FilterQuery<SparkGPTQuestion>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<SparkGPTQuestion>,
    options?: QueryOptions<SparkGPTQuestion>,
  ): Promise<SparkGPTQuestion> {
    return this.spark_gpt_question_model
      .findOne(filter, projection, options)
      .populate({
        path: 'workspace',
      })
      .exec();
  }

  async update_many(
    filter?: FilterQuery<SparkGPTQuestion>,
    update?: UpdateWithAggregationPipeline | UpdateQuery<SparkGPTQuestion>,
    options?: QueryOptions<SparkGPTQuestion>,
  ): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }

  async update_one(
    filter: FilterQuery<SparkGPTQuestion>,
    update: UpdateQuery<SparkGPTQuestion>,
  ): Promise<SparkGPTQuestion> {
    return this.spark_gpt_question_model
      .findOneAndUpdate(filter, update, { new: true })
      .populate({
        path: 'workspace',
      })
      .exec();
  }

  async delete_one(
    filter: FilterQuery<SparkGPTQuestion>,
    options?: QueryOptions<SparkGPTQuestion>,
  ): Promise<any> {
    return this.spark_gpt_question_model.deleteOne(filter).exec();
  }

  async delete_many(filter: FilterQuery<SparkGPTQuestion>): Promise<any> {
    return this.spark_gpt_question_model.deleteMany(filter).exec();
  }

  async check_exists(filter: FilterQuery<SparkGPTQuestion>): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async update_current(doc: SparkGPTQuestion): Promise<SparkGPTQuestion> {
    throw new Error('Method not implemented.');
  }
}

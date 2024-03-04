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
import { Survey } from '../entities/survey.entity';

export class SurveyRepository extends BaseRepository<Survey> {
  constructor(@InjectModel(Survey.name) private survey_model: Model<Survey>) {
    super();
  }
  async create(doc: AnyObject | AnyKeys<Survey>): Promise<Survey> {
    const survey = await this.survey_model.create(doc);
    return survey;
  }

  async get_by_id(
    id: any,
    projection?: ProjectionType<Survey>,
    options?: QueryOptions<Survey>,
  ): Promise<Survey> {
    const survey = await this.survey_model.findById(id, projection, options);
    return survey;
  }

  async update_one_by_id(
    id: string,
    update: UpdateQuery<Survey>,
  ): Promise<Survey> {
    const survey = await this.survey_model.findByIdAndUpdate(id, update, {
      new: true,
    });
    return survey;
  }

  async delete_by_id(id?: string): Promise<any> {
    const survey = await this.survey_model.findByIdAndDelete(id);
    return survey;
  }

  get_one(
    filter?: FilterQuery<Survey>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<Survey>,
    options?: QueryOptions<Survey>,
  ): Promise<Survey> {
    throw new Error('Method not implemented.');
  }
  async get_all(
    filter: FilterQuery<Survey>,
    projection?: ProjectionType<Survey>,
  ): Promise<Survey[]> {
    return await this.survey_model.find(filter, projection);
  }

  update_many(
    filter?: FilterQuery<Survey>,
    update?: UpdateQuery<Survey> | UpdateWithAggregationPipeline,
    options?: QueryOptions<Survey>,
  ): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }
  update_one(
    filter: FilterQuery<Survey>,
    update: UpdateQuery<Survey>,
  ): Promise<Survey> {
    throw new Error('Method not implemented.');
  }

  delete_one(
    filter: FilterQuery<Survey>,
    options?: QueryOptions<Survey>,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }

  delete_many(filter: FilterQuery<Survey>): Promise<any> {
    throw new Error('Method not implemented.');
  }

  check_exists(filter: FilterQuery<Survey>): Promise<any> {
    throw new Error('Method not implemented.');
  }
}

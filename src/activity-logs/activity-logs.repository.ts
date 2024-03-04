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
import { ActivityLog } from './entities/activity-log.entity';

export class ActivityLogsRepository extends BaseRepository<ActivityLog> {
  constructor(
    @InjectModel(ActivityLog.name)
    private activity_logs_model: Model<ActivityLog>,
  ) {
    super();
  }

  create(doc: AnyObject | AnyKeys<ActivityLog>): Promise<ActivityLog> {
    return this.activity_logs_model.create(doc);
  }

  get_all(
    filter: FilterQuery<ActivityLog>,
    projection?: ProjectionType<ActivityLog>,
    options?: QueryOptions<ActivityLog>,
  ): Promise<ActivityLog[]> {
    return this.activity_logs_model
      .find(filter, projection, options)
      .populate([
        {
          path: 'created_by',
          select: 'user_name',
        },
      ])
      .exec();
  }

  get_by_id(
    id: any,
    projection?: ProjectionType<ActivityLog>,
    options?: QueryOptions<ActivityLog>,
  ): Promise<ActivityLog> {
    throw new Error('Method not implemented.');
  }
  get_one(
    filter?: FilterQuery<ActivityLog>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<ActivityLog>,
    options?: QueryOptions<ActivityLog>,
  ): Promise<ActivityLog> {
    throw new Error('Method not implemented.');
  }
  update_many(
    filter?: FilterQuery<ActivityLog>,
    update?: UpdateQuery<ActivityLog> | UpdateWithAggregationPipeline,
    options?: QueryOptions<ActivityLog>,
  ): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }
  update_one(
    filter: FilterQuery<ActivityLog>,
    update: UpdateQuery<ActivityLog>,
  ): Promise<ActivityLog> {
    throw new Error('Method not implemented.');
  }
  update_one_by_id(
    id: string,
    update: UpdateQuery<ActivityLog>,
  ): Promise<ActivityLog> {
    throw new Error('Method not implemented.');
  }
  delete_by_id(id?: string, options?: QueryOptions<ActivityLog>): Promise<any> {
    throw new Error('Method not implemented.');
  }
  delete_one(
    filter: FilterQuery<ActivityLog>,
    options?: QueryOptions<ActivityLog>,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  delete_many(filter: FilterQuery<ActivityLog>): Promise<any> {
    throw new Error('Method not implemented.');
  }

  check_exists(filter: FilterQuery<ActivityLog>): Promise<any> {
    throw new Error('Method not implemented.');
  }
}

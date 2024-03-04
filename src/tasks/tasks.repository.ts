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
import { Task } from './entities/task.entity';

export class TaskRepository extends BaseRepository<Task> {
  constructor(
    @InjectModel(Task.name)
    private task_model: Model<Task>,
  ) {
    super();
  }
  async create(doc: AnyObject | AnyKeys<Task>): Promise<Task> {
    return this.task_model.create(doc);
  }
  async get_all(
    filter: FilterQuery<Task>,
    projection?: ProjectionType<Task>,
    options?: QueryOptions<Task>,
  ): Promise<Task[]> {
    return this.task_model
      .find(filter, projection, options)
      .populate([
        {
          path: 'assignedUser',
          select: '_id user_name profile_picture_url',
        },
      ])
      .exec();
  }
  async get_by_id(
    id: any,
    projection?: ProjectionType<Task>,
    options?: QueryOptions<Task>,
  ): Promise<Task> {
    return this.task_model.findById(id, projection, options);
  }

  async update_one_by_id(id: string, update: UpdateQuery<Task>): Promise<Task> {
    return this.task_model.findByIdAndUpdate(id, update, {
      new: true,
    });
  }

  async delete_by_id(id?: string, options?: QueryOptions<Task>): Promise<Task> {
    return this.task_model.findByIdAndDelete(id, options);
  }

  delete_one(
    filter: FilterQuery<Task>,
    options?: QueryOptions<Task>,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  get_one(
    filter?: FilterQuery<Task>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<Task>,
    options?: QueryOptions<Task>,
  ): Promise<Task> {
    throw new Error('Method not implemented.');
  }
  update_many(
    filter?: FilterQuery<Task>,
    update?: UpdateQuery<Task> | UpdateWithAggregationPipeline,
    options?: QueryOptions<Task>,
  ): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }
  update_one(
    filter: FilterQuery<Task>,
    update: UpdateQuery<Task>,
  ): Promise<Task> {
    throw new Error('Method not implemented.');
  }
  delete_many(filter: FilterQuery<Task>): Promise<any> {
    throw new Error('Method not implemented.');
  }

  check_exists(filter: FilterQuery<Task>): Promise<any> {
    throw new Error('Method not implemented.');
  }
}

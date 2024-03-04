import {
  AnyKeys,
  AnyObject,
  Callback,
  Document,
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  UpdateWriteOpResult,
} from 'mongoose';

export abstract class BaseRepository<T extends Document> {
  abstract get_all(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T[]>;
  abstract get_by_id(
    id: any,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T>;

  abstract get_one(
    filter?: FilterQuery<T>,
    populate?: string | string[],
    select?: any,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T>;
  abstract update_many(
    filter?: FilterQuery<T>,
    update?: UpdateWithAggregationPipeline | UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<UpdateWriteOpResult>;
  abstract update_one(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
  ): Promise<T>;
  abstract update_one_by_id(id: string, update: UpdateQuery<T>): Promise<T>;
  abstract delete_by_id(id?: string, options?: QueryOptions<T>): Promise<any>;
  abstract delete_one(
    filter: FilterQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<any>;
  abstract delete_many(filter: FilterQuery<T>): Promise<any>;
  abstract create(doc: AnyObject | AnyKeys<T>): Promise<T>;
  abstract check_exists(filter: FilterQuery<T>): Promise<any>;
  update_current(doc: T) {
    return doc.save();
  }
}

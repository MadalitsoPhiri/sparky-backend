import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AnyKeys,
  AnyObject,
  Callback,
  CallbackWithoutResult,
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';
import { BaseRepository } from 'src/app/entities/Base.repository';
import { WorkSpaceDefaults } from '../entities';

@Injectable()
export class WorkSpaceDefaultsRepository extends BaseRepository<WorkSpaceDefaults> {
  delete_one(
    filter: FilterQuery<WorkSpaceDefaults>,
    options?: QueryOptions<WorkSpaceDefaults>,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(WorkSpaceDefaults.name)
    private work_space_defaults_model: Model<WorkSpaceDefaults>,
  ) {
    super();
  }

  get_all(
    filter: FilterQuery<WorkSpaceDefaults>,
    projection: ProjectionType<WorkSpaceDefaults> = {},
    options: QueryOptions<WorkSpaceDefaults> = {},
    populate?: string | string[],
    select?: any,
  ): Promise<WorkSpaceDefaults[]> {
    if (populate) {
      return this.work_space_defaults_model
        .find(filter, projection)
        .populate(populate, select)
        .exec();
    } else {
      return this.work_space_defaults_model.find(filter, projection).exec();
    }
  }
  async get_by_id(id: string): Promise<WorkSpaceDefaults> {
    //TODO:Check shape of database object here and update it

    const workspace_default = await this.work_space_defaults_model
      .findById(id)
      .populate({ path: 'workspace', populate: { path: 'created_by' } })
      .exec();
    if (workspace_default) {
      return this.check_workspace_object_shape(workspace_default);
    } else {
      return workspace_default;
    }
  }
  async get_one(
    filter?: FilterQuery<WorkSpaceDefaults>,
    projection: ProjectionType<WorkSpaceDefaults> = {},

    options: QueryOptions<WorkSpaceDefaults> = {},
  ): Promise<WorkSpaceDefaults> {
    const workspace_default = await this.work_space_defaults_model
      .findOne(filter, projection, options)
      .populate({ path: 'workspace', populate: { path: 'created_by' } })
      .exec();

    if (workspace_default) {
      return this.check_workspace_object_shape(workspace_default);
    } else {
      return workspace_default;
    }
  }
  update_one(
    filter: FilterQuery<WorkSpaceDefaults>,
    update: UpdateQuery<WorkSpaceDefaults>,
  ): Promise<WorkSpaceDefaults> {
    return this.work_space_defaults_model
      .findOneAndUpdate(filter, update, { new: true })
      .populate({ path: 'workspace', populate: { path: 'created_by' } })
      .exec();
  }

  update_one_by_id(
    id: string,
    update: UpdateQuery<WorkSpaceDefaults>,
  ): Promise<WorkSpaceDefaults> {
    return this.work_space_defaults_model
      .findByIdAndUpdate(id, update, { new: true, upsert: true })
      .populate({ path: 'workspace', populate: { path: 'created_by' } })
      .exec();
  }
  update_many(
    filter: FilterQuery<WorkSpaceDefaults>,
    update: UpdateQuery<WorkSpaceDefaults> = {},
    options: QueryOptions<WorkSpaceDefaults> = {},
  ): Promise<UpdateWriteOpResult> {
    return this.work_space_defaults_model
      .updateMany(filter, update, options)
      .exec();
  }

  async create(
    doc: AnyObject | AnyKeys<WorkSpaceDefaults>,
  ): Promise<WorkSpaceDefaults> {
    const workspace_default = await this.work_space_defaults_model.create(doc);
    return workspace_default.save();
  }
  // a function to help upgrade the data shape
  async check_workspace_object_shape(
    workspace_default: WorkSpaceDefaults,
  ): Promise<WorkSpaceDefaults> {
    return Promise.resolve(workspace_default);
  }
  delete_by_id(
    id?: string,
    options?: QueryOptions<WorkSpaceDefaults>,
  ): Promise<any> {
    return this.work_space_defaults_model.findByIdAndDelete(id, options).exec();
  }
  delete_many(
    filter?: FilterQuery<WorkSpaceDefaults>,
    options?: QueryOptions<WorkSpaceDefaults>,
  ): Promise<any> {
    return this.work_space_defaults_model.deleteMany(filter, options).exec();
  }
  update_current(doc: WorkSpaceDefaults): Promise<WorkSpaceDefaults> {
    return doc.save();
  }
  check_exists(filter: FilterQuery<WorkSpaceDefaults>): Promise<any> {
    return this.work_space_defaults_model.exists(filter).exec();
  }
}

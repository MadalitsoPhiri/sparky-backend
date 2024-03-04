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
import { WorkSpaces } from '../entities';

@Injectable()
export class WorkspaceRepository extends BaseRepository<WorkSpaces> {
  delete_one(
    filter: FilterQuery<WorkSpaces>,
    options?: QueryOptions<WorkSpaces>,
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(WorkSpaces.name) private work_spaces_model: Model<WorkSpaces>,
  ) {
    super();
  }

  get_all(
    filter: FilterQuery<WorkSpaces>,
    projection: ProjectionType<WorkSpaces> = {},
    options: QueryOptions<WorkSpaces> = {},
    populate?: string | string[],
    select?: any,
  ): Promise<WorkSpaces[]> {
    if (populate) {
      return this.work_spaces_model
        .find(filter, projection)
        .populate({
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        })
        .exec();
    } else {
      return this.work_spaces_model.find(filter, projection).exec();
    }
  }
  async get_by_id(
    id: string,
    populate?: string | string[],
    select?: any,
  ): Promise<WorkSpaces> {
    //TODO:Check shape of database object here and update it
    if (populate) {
      const work_space = await this.work_spaces_model
        .findById(id)
        .populate({
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        })
        .exec();
      return this.check_workspace_object_shape(work_space);
    } else {
      const workspace = await this.work_spaces_model.findById(id);

      if (workspace) {
        return this.check_workspace_object_shape(workspace, populate);
      } else {
        return workspace;
      }
    }
  }
  async get_one(
    filter?: FilterQuery<WorkSpaces>,
    projection: ProjectionType<WorkSpaces> = {},
    populate?: string | string[],
    select?: any,
    options: QueryOptions<WorkSpaces> = {},
  ): Promise<WorkSpaces> {
    if (populate) {
      const work_space = await this.work_spaces_model
        .findOne(filter, projection, options)
        .populate({
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        })
        .exec();
      return this.check_workspace_object_shape(work_space);
    } else {
      const workspace = await this.work_spaces_model.findOne(
        filter,
        projection,
        options,
      );

      if (workspace) {
        return this.check_workspace_object_shape(workspace, populate);
      } else {
        return workspace;
      }
    }
  }

  update_one(
    filter: FilterQuery<WorkSpaces>,
    update: UpdateQuery<WorkSpaces>,
  ): Promise<WorkSpaces> {
    return this.work_spaces_model
      .findOneAndUpdate(filter, update, { new: true })
      .populate({
        path: 'created_by',
        select:
          '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
      })
      .exec();
  }
  update_one_by_id(
    id: string,
    update: UpdateQuery<WorkSpaces>,
  ): Promise<WorkSpaces> {
    return this.work_spaces_model
      .findByIdAndUpdate(id, update, { new: true })
      .populate({
        path: 'created_by',
        select:
          '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
      })
      .exec();
  }
  update_many(
    filter: FilterQuery<WorkSpaces>,
    update: UpdateQuery<WorkSpaces> = {},
    options: QueryOptions<WorkSpaces> = {},
  ): Promise<UpdateWriteOpResult> {
    return this.work_spaces_model.updateMany(filter, update, options).exec();
  }

  async create(doc: AnyObject | AnyKeys<WorkSpaces>): Promise<WorkSpaces> {
    const work_space = await this.work_spaces_model.create(doc);
    return work_space.save();
  }
  // a function to help upgrade the data shape
  async check_workspace_object_shape(
    workspace: WorkSpaces,
    populate?: string | string[],
  ): Promise<WorkSpaces> {
    return Promise.resolve(workspace);
  }
  delete_by_id(id?: string, options?: QueryOptions<WorkSpaces>): Promise<any> {
    return this.work_spaces_model.findByIdAndDelete(id, options).exec();
  }
  delete_many(
    filter?: FilterQuery<WorkSpaces>,
    options?: QueryOptions<WorkSpaces>,
  ): Promise<any> {
    return this.work_spaces_model.deleteMany(filter, options).exec();
  }
  update_current(doc: WorkSpaces): Promise<WorkSpaces> {
    return doc.save();
  }
  check_exists(filter: FilterQuery<WorkSpaces>): Promise<any> {
    return this.work_spaces_model.exists(filter).exec();
  }
}

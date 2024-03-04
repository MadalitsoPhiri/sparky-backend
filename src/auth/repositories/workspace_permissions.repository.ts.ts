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
import { WorkSpacePermissions, WorkSpaceTeamMates } from '../entities';

@Injectable()
export class WorkSpacePermissionsRepository extends BaseRepository<WorkSpacePermissions> {
  constructor(
    @InjectModel(WorkSpaceTeamMates.name)
    private workspace_team_mate_model: Model<WorkSpaceTeamMates>,
    @InjectModel(WorkSpacePermissions.name)
    private work_space_permissions_model: Model<WorkSpacePermissions>,
  ) {
    super();
  }

  get_all(
    filter: FilterQuery<WorkSpacePermissions>,
    projection: ProjectionType<WorkSpacePermissions> = {},
  ): Promise<WorkSpacePermissions[]> {
    return this.work_space_permissions_model
      .find(filter, projection)
      .populate({
        path: 'team_mate',
        populate: {
          path: 'user',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .exec();
  }
  async get_by_id(id: string): Promise<WorkSpacePermissions> {
    const work_space_permissions = await this.work_space_permissions_model
      .findById(id)
      .populate({
        path: 'team_mate',
        populate: {
          path: 'user',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .exec();

    if (work_space_permissions) {
      return this.check_workspace_object_shape(work_space_permissions);
    } else {
      return work_space_permissions;
    }
  }
  async get_one(
    filter?: FilterQuery<WorkSpacePermissions>,
    projection: ProjectionType<WorkSpacePermissions> = {},
    select?: any,
    options: QueryOptions<WorkSpacePermissions> = {},
  ): Promise<WorkSpacePermissions> {
    const work_space_permissions = await this.work_space_permissions_model
      .findOne(filter, projection, options)
      .populate({
        path: 'team_mate',
        populate: {
          path: 'user',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .exec();

    if (work_space_permissions) {
      return this.check_workspace_object_shape(work_space_permissions);
    } else {
      return work_space_permissions;
    }
  }

  update_one(
    filter: FilterQuery<WorkSpacePermissions>,
    update: UpdateQuery<WorkSpacePermissions>,
  ): Promise<WorkSpacePermissions> {
    return this.work_space_permissions_model
      .findOneAndUpdate(filter, update, { new: true })
      .populate({
        path: 'team_mate',
        populate: {
          path: 'user',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .exec();
  }
  update_one_by_id(
    id: string,
    update: UpdateQuery<WorkSpacePermissions>,
  ): Promise<WorkSpacePermissions> {
    return this.work_space_permissions_model
      .findByIdAndUpdate(id, update, { new: true })
      .populate({
        path: 'team_mate',
        populate: {
          path: 'user',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .exec();
  }
  update_many(
    filter: FilterQuery<WorkSpacePermissions>,
    update: UpdateQuery<WorkSpacePermissions> = {},
    options: QueryOptions<WorkSpacePermissions> = {},
  ): Promise<UpdateWriteOpResult> {
    return this.work_space_permissions_model
      .updateMany(filter, update, options)
      .populate('team_mate', '', this.workspace_team_mate_model)
      .exec();
  }

  async create(
    doc: AnyObject | AnyKeys<WorkSpacePermissions>,
  ): Promise<WorkSpacePermissions> {
    const work_space_permissions =
      await this.work_space_permissions_model.create(doc);
    return work_space_permissions.save();
  }
  //Check shape of database object here and update it
  async check_workspace_object_shape(
    work_space_permissions: WorkSpacePermissions,
  ): Promise<WorkSpacePermissions> {
    return Promise.resolve(work_space_permissions);
  }
  delete_one(
    filter: FilterQuery<WorkSpacePermissions>,
    options?: QueryOptions<WorkSpacePermissions>,
  ): Promise<any> {
    return this.work_space_permissions_model
      .deleteOne(filter, { new: true })
      .exec();
  }

  delete_by_id(
    id?: string,
    options?: QueryOptions<WorkSpacePermissions>,
  ): Promise<any> {
    return this.work_space_permissions_model
      .findByIdAndDelete(id, options)
      .exec();
  }
  delete_many(
    filter?: FilterQuery<WorkSpacePermissions>,
    options?: QueryOptions<WorkSpacePermissions>,
  ): Promise<any> {
    return this.work_space_permissions_model.deleteMany(filter, options).exec();
  }
  async update_current(
    doc: WorkSpacePermissions,
  ): Promise<WorkSpacePermissions> {
    const result = await doc.save();
    return result.populate('team_mate', '', this.workspace_team_mate_model);
  }
  check_exists(filter: FilterQuery<WorkSpacePermissions>): Promise<any> {
    return this.work_space_permissions_model.exists(filter).exec();
  }
}

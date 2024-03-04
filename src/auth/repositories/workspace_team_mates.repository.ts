import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AnyKeys,
  AnyObject,
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';
import { BaseRepository } from 'src/app/entities/Base.repository';
import { WorkSpaceTeamMates, WorkSpaces } from '../entities';

@Injectable()
export class WorkSpaceTeamMatesRepository extends BaseRepository<WorkSpaceTeamMates> {
  delete_one(
    filter: FilterQuery<WorkSpaceTeamMates>,
    options?: QueryOptions<WorkSpaceTeamMates>,
  ): Promise<any> {
    return this.workspace_team_mate_model.deleteOne(filter, options).exec();
  }
  constructor(
    @InjectModel(WorkSpaceTeamMates.name)
    private workspace_team_mate_model: Model<WorkSpaceTeamMates>,
    @InjectModel(WorkSpaces.name)
    private workspaces_model: Model<WorkSpaces>,
  ) {
    super();
  }

  async get_all(
    filter: FilterQuery<WorkSpaceTeamMates>,
    projection: ProjectionType<WorkSpaceTeamMates> = {},
  ): Promise<WorkSpaceTeamMates[]> {
    return this.workspace_team_mate_model
      .find(filter, projection)
      .populate({
        path: 'workspace',
        populate: {
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .populate({
        path: 'user',
        select:
          '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
      })
      .exec();
  }
  async get_by_id(id: string): Promise<WorkSpaceTeamMates> {
    //TODO:Check shape of database object here and update it

    const workspace_team_mate = await this.workspace_team_mate_model
      .findById(id)
      .populate({
        path: 'workspace',
        populate: {
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .exec();

    if (workspace_team_mate) {
      return this.check_workspace_object_shape(workspace_team_mate);
    } else {
      return workspace_team_mate;
    }
  }
  async get_one(
    filter?: FilterQuery<WorkSpaceTeamMates>,
    projection: ProjectionType<WorkSpaceTeamMates> = {},
    options: QueryOptions<WorkSpaceTeamMates> = {},
  ): Promise<WorkSpaceTeamMates> {
    const workspace_team_mate = await this.workspace_team_mate_model
      .findOne(filter, projection, options)
      .populate({
        path: 'workspace',
        populate: {
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .exec();

    if (workspace_team_mate) {
      return this.check_workspace_object_shape(workspace_team_mate);
    } else {
      return workspace_team_mate;
    }
  }
  async update_one_by_id(
    id: string,
    update: UpdateQuery<WorkSpaceTeamMates>,
  ): Promise<WorkSpaceTeamMates> {
    return this.workspace_team_mate_model
      .findByIdAndUpdate(id, update, {
        new: true,
      })
      .populate({
        path: 'workspace',
        populate: {
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .exec();
  }
  async update_one(
    filter: FilterQuery<WorkSpaceTeamMates>,
    update: UpdateQuery<WorkSpaceTeamMates>,
  ) {
    return this.workspace_team_mate_model
      .findOneAndUpdate(filter, update, { new: true })
      .populate({
        path: 'workspace',
        populate: {
          path: 'created_by',
          select:
            '_id user_name email profile_picture_url away bio country whatsapp_number last_opened_email type first_seen last_seen phone_number',
        },
      })
      .exec();
  }
  async update_many(
    filter: FilterQuery<WorkSpaceTeamMates>,
    update: UpdateQuery<WorkSpaceTeamMates> = {},
    options: QueryOptions<WorkSpaceTeamMates> = {},
  ): Promise<UpdateWriteOpResult> {
    return this.workspace_team_mate_model.updateMany(filter, update, options);
    // .exec();
  }

  async create(
    doc: AnyObject | AnyKeys<WorkSpaceTeamMates>,
  ): Promise<WorkSpaceTeamMates> {
    const workspace_team_mate = await this.workspace_team_mate_model.create(
      doc,
    );
    return workspace_team_mate.save();
  }
  // a function to help upgrade the data shape
  async check_workspace_object_shape(
    workworkspace_team_mate: WorkSpaceTeamMates,
  ): Promise<WorkSpaceTeamMates> {
    return Promise.resolve(workworkspace_team_mate);
  }
  delete_by_id(
    id?: string,
    options?: QueryOptions<WorkSpaceTeamMates>,
  ): Promise<any> {
    return this.workspace_team_mate_model.findByIdAndDelete(id, options).exec();
  }
  async delete_many(
    filter?: FilterQuery<WorkSpaceTeamMates>,
    options?: QueryOptions<WorkSpaceTeamMates>,
  ): Promise<any> {
    return this.workspace_team_mate_model.deleteMany(filter, options).exec();
  }
  update_current(doc: WorkSpaceTeamMates): Promise<WorkSpaceTeamMates> {
    return doc.save();
  }
  check_exists(filter: FilterQuery<WorkSpaceTeamMates>): Promise<any> {
    return this.workspace_team_mate_model.exists(filter).exec();
  }
}
